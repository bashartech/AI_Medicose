"""
Images Routes
==============
Handle medical image uploads and ML analysis (Workflow 1).
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import logging
import uuid

from app.models.schemas import ImageUploadResponse, ImageAnalysisRequest, ImageAnalysisResponse, WebcamCaptureRequest
from app.services.professional_image_analysis import ProfessionalImageAnalysisService
from app.services.file_service import FileService
from app.services.database_service import DatabaseService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    image_type: str = Form(...),
    specialist_type: str = Form(...),
    user_id: str = Form(None)
):
    """
    Upload medical image for ML analysis (Workflow 1)
    """
    try:
        # Generate proper UUID if not provided
        if not user_id or user_id == "temp-user":
            user_id = str(uuid.uuid4())
        
        # Read file bytes
        file_bytes = await file.read()
        
        # Validate file type
        allowed_types = ['image/png', 'image/jpeg', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"File type not allowed. Accepted: {allowed_types}")
        
        # Upload to Supabase Storage
        file_service = FileService()
        upload_result = await file_service.upload_file(
            file_bytes=file_bytes,
            file_name=file.filename or "image",
            bucket="medical-images",
            user_id=user_id,
            file_type=file.content_type
        )
        
        # Run professional ML analysis using Gemini Vision
        image_service = ProfessionalImageAnalysisService()
        analysis_result = await image_service.analyze_medical_image(
            image_bytes=file_bytes,
            image_type=image_type,
            specialist_type=specialist_type
        )
        
        # Convert image to base64 for immediate display (fallback if storage fails)
        import base64
        image_base64 = f"data:{file.content_type or 'image/jpeg'};base64,{base64.b64encode(file_bytes).decode()}"
        
        # If analysis succeeded, add both storage URL and base64 to the result
        if analysis_result.get("success"):
            analysis_result["image_url"] = upload_result.get("public_url", "")
            analysis_result["image_base64"] = image_base64  # For immediate display
        
        # Save to database
        db_service = DatabaseService()
        db_result = await db_service.save_image_analysis(
            user_id=user_id,
            file_name=file.filename or "image",
            file_path=upload_result.get("file_path", ""),
            image_url=upload_result.get("public_url", ""),
            file_size=len(file_bytes),
            image_type=image_type,
            ml_results=analysis_result,
            specialist_type=specialist_type
        )
        
        # Use database ID if successful, otherwise generate UUID for development
        if db_result.get("success") and db_result.get("data", {}).get("id"):
            image_id = db_result["data"]["id"]
        else:
            # Generate UUID for development mode if database save fails
            image_id = str(uuid.uuid4())
            logger.warning(f"Database save failed, using generated UUID: {image_id}")
        
        return ImageUploadResponse(
            image_id=image_id,
            file_name=file.filename or "image",
            file_path=upload_result.get("file_path", ""),
            image_type=image_type,
            image_url=analysis_result.get("image_base64", upload_result.get("public_url", "")),
            file_size=len(file_bytes),
            ml_results=analysis_result,
            specialist_type=specialist_type,
            status="completed",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{image_id}")
async def get_image(image_id: str):
    """Get image details and analysis"""
    try:
        db_service = DatabaseService()
        result = await db_service.get_image_by_id(image_id)

        if result.get("success"):
            data = result["data"]
            # Ensure ml_analysis_result has the right structure
            ml_results = data.get("ml_analysis_result", {})
            
            # Get image URL - prefer base64 if storage URL is mock
            image_url = data.get("image_url", "")
            if not image_url or image_url.startswith("data:image/png;base64,mock"):
                image_url = ml_results.get("image_base64", "")
            
            return {
                "id": data.get("id"),
                "file_name": data.get("file_name"),
                "file_type": data.get("image_type"),
                "file_size": data.get("file_size"),
                "image_url": image_url,
                "image_type": data.get("image_type"),
                "specialist_type": data.get("specialist_type"),
                "status": data.get("status"),
                "ml_analysis_result": {
                    "analysis_text": ml_results.get("analysis_text", ""),
                    "image_type": ml_results.get("image_type", data.get("image_type")),
                    "specialist_type": ml_results.get("specialist_type", data.get("specialist_type")),
                    "error": ml_results.get("error")
                },
                "created_at": data.get("created_at")
            }
        else:
            raise HTTPException(status_code=404, detail=result.get("error", "Image not found"))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get image error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/capture")
async def capture_from_webcam(request: WebcamCaptureRequest):
    """
    Capture image from webcam (Workflow 1)
    
    Will be fully implemented in Phase 4
    """
    return {"success": True, "image_id": "temp-id"}


@router.delete("/{image_id}")
async def delete_image(image_id: str):
    """Delete image"""
    # Will be implemented later
    raise HTTPException(status_code=501, detail="Not yet implemented")
