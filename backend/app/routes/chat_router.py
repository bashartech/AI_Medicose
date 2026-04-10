"""
Chat Routes
============
Handle chat conversations with AI specialist agents.
Supports both regular chat and chat with file upload (Workflow 2).
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Dict, Optional
import logging
import uuid

from app.models.schemas import ChatRequest, ChatResponse, ChatWithFileResponse
from app.agents.registry import get_agent, get_all_agents
from app.services.professional_image_analysis import ProfessionalImageAnalysisService
from app.services.ocr_service import OCRService
from app.services.file_service import FileService
from app.services.triage_service import classify_triage

logger = logging.getLogger(__name__)
router = APIRouter()

# Store active sessions (in production, use Redis or database)
active_sessions: Dict[str, list] = {}


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send message to AI specialist agent (regular text chat)
    
    - **message**: User's health question or concern
    - **agent_id**: ID of the specialist agent
    - **session_id**: Optional session ID for conversation continuity
    """
    try:
        # Get agent instance
        agent = get_agent(request.agent_id)
        
        # Get conversation context if session exists
        context = None
        if request.session_id and request.session_id in active_sessions:
            context = "\n".join([
                f"{msg['role']}: {msg['content']}"
                for msg in active_sessions[request.session_id][-5:]  # Last 5 messages
            ])
        
        # Run agent
        response_text = await agent.run(request.message, context)

        # Get triage analysis
        triage_result = classify_triage(request.message)

        # Store in session
        if not request.session_id:
            request.session_id = str(uuid.uuid4())

        if request.session_id not in active_sessions:
            active_sessions[request.session_id] = []

        active_sessions[request.session_id].append({
            "role": "user",
            "content": request.message
        })
        active_sessions[request.session_id].append({
            "role": "assistant",
            "content": response_text
        })

        return ChatResponse(
            response=response_text,
            session_id=request.session_id,
            triage=triage_result
        )
        
    except ValueError as e:
        logger.error(f"Agent error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/agents")
async def list_agents():
    """Get list of all available specialist agents"""
    return {"agents": get_all_agents()}


@router.post("/session/new")
async def create_session():
    """Create new chat session"""
    session_id = str(uuid.uuid4())
    active_sessions[session_id] = []
    return {"session_id": session_id}


@router.get("/session/{session_id}")
async def get_session_history(session_id: str):
    """Get chat session history"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "messages": active_sessions[session_id]
    }


@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear chat session history"""
    if session_id in active_sessions:
        del active_sessions[session_id]
    return {"success": True, "message": "Session cleared"}


@router.post("/analyze", response_model=ChatWithFileResponse)
async def chat_with_file(
    file: UploadFile = File(...),
    agent_id: str = Form(...),
    message: str = Form("Please analyze this"),
    session_id: str = Form(None)
):
    """
    Chat with file upload - AI analyzes file in conversational context (Workflow 2)
    
    - **file**: Image or PDF file to analyze
    - **agent_id**: Specialist agent ID
    - **message**: User's message about the file
    - **session_id**: Optional session ID
    """
    try:
        from app.services.file_service import FileService
        from app.services.ocr_service import OCRService
        from app.services.image_analysis_service import ImageAnalysisService
        import uuid
        
        # Read file bytes
        file_bytes = await file.read()
        is_image = file.content_type and file.content_type.startswith('image/')
        is_pdf = file.content_type and 'pdf' in file.content_type
        
        # Upload to storage (use temp user_id for now, will be replaced with auth)
        file_service = FileService()
        user_id = "temp-user"  # TODO: Get from auth
        bucket = "medical-images" if is_image else "medical-reports"
        
        upload_result = await file_service.upload_file(
            file_bytes=file_bytes,
            file_name=file.filename or "upload",
            bucket=bucket,
            user_id=user_id,
            file_type=file.content_type
        )
        
        # Run professional analysis based on file type
        analysis_result = None
        if is_image:
            # Use Gemini Vision for professional image analysis
            image_service = ProfessionalImageAnalysisService()
            
            # Detect image type from filename
            filename = (file.filename or "").lower()
            if any(keyword in filename for keyword in ["xray", "x-ray", "chest", "bone", "fracture"]):
                image_type = "xray"
            elif any(keyword in filename for keyword in ["mri", "magnetic", "resonance"]):
                image_type = "mri"
            elif any(keyword in filename for keyword in ["ct", "cat", "scan"]):
                image_type = "ct_scan"
            elif any(keyword in filename for keyword in ["skin", "rash", "mole", "lesion"]):
                image_type = "skin"
            elif any(keyword in filename for keyword in ["oral", "dental", "mouth", "tooth"]):
                image_type = "oral"
            elif any(keyword in filename for keyword in ["posture", "body", "spine"]):
                image_type = "posture"
            else:
                image_type = "unknown"
            
            analysis_result = await image_service.analyze_medical_image(
                image_bytes=file_bytes,
                image_type=image_type,
                specialist_type=agent_id
            )
        elif is_pdf:
            ocr_service = OCRService()
            analysis_result = await ocr_service.process_medical_report(file_bytes, file.content_type or "application/pdf")
        
        # Build context with analysis results
        file_context = {
            "file_type": file.content_type,
            "file_name": file.filename,
        }
        
        if is_image and analysis_result:
            # Professional image analysis
            file_context["ml_results"] = analysis_result
        elif is_pdf and analysis_result:
            # OCR text from report
            file_context["ocr_text"] = analysis_result.get("ocr_text", "")
            file_context["structured_data"] = analysis_result.get("structured_data", {})
        
        # Get AI agent response with file context
        agent = get_agent(agent_id)
        response_text = await agent.run_with_file(message, file_context)
        
        # Store in session
        if not session_id:
            session_id = str(uuid.uuid4())
        
        if session_id not in active_sessions:
            active_sessions[session_id] = []
        
        active_sessions[session_id].append({
            "role": "user",
            "content": message,
            "file": file.filename
        })
        active_sessions[session_id].append({
            "role": "assistant",
            "content": response_text
        })

        # Get triage analysis
        triage_result = classify_triage(message)

        # Return clean response with attachment info
        return ChatWithFileResponse(
            response=response_text,
            session_id=session_id,
            attachment={
                "type": "image" if is_image else "pdf",
                "url": upload_result.get("public_url", ""),
                "file_name": file.filename,
                "analysis": analysis_result
            },
            triage=triage_result
        )
    except Exception as e:
        logger.error(f"Chat with file error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
