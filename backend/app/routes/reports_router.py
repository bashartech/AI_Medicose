"""
Reports Routes
================
Handle medical report uploads and OCR processing (Workflow 1).
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import logging
import uuid

from app.models.schemas import ReportUploadResponse, ReportAnalysisRequest, ReportAnalysisResponse
from app.services.ocr_service import OCRService
from app.services.file_service import FileService
from app.services.database_service import DatabaseService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload", response_model=ReportUploadResponse)
async def upload_report(
    file: UploadFile = File(...),
    specialist_type: str = Form(...),
    user_id: str = Form(None)
):
    """
    Upload medical report (PDF/image) for OCR processing (Workflow 1)
    """
    try:
        # Generate proper UUID if not provided
        if not user_id or user_id == "temp-user":
            user_id = str(uuid.uuid4())
        
        # Read file bytes
        file_bytes = await file.read()
        
        # Validate file type
        allowed_types = ['application/pdf', 'image/png', 'image/jpeg']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"File type not allowed. Accepted: {allowed_types}")
        
        # Upload to Supabase Storage
        file_service = FileService()
        upload_result = await file_service.upload_file(
            file_bytes=file_bytes,
            file_name=file.filename or "report",
            bucket="medical-reports",
            user_id=user_id,
            file_type=file.content_type
        )
        
        # Run OCR analysis
        ocr_service = OCRService()
        ocr_result = await ocr_service.process_medical_report(file_bytes, file.content_type or "application/pdf")
        
        # Save to database
        db_service = DatabaseService()
        db_result = await db_service.save_report_analysis(
            user_id=user_id,
            file_name=file.filename or "report",
            file_path=upload_result.get("file_path", ""),
            file_type=file.content_type or "unknown",
            file_size=len(file_bytes),
            ocr_text=ocr_result.get("ocr_text", ""),
            structured_data=ocr_result.get("structured_data", {}),
            specialist_type=specialist_type,
            report_type="other"
        )
        
        # Use database ID if successful, otherwise generate UUID for development
        if db_result.get("success") and db_result.get("data", {}).get("id"):
            report_id = db_result["data"]["id"]
        else:
            # Generate UUID for development mode if database save fails
            report_id = str(uuid.uuid4())
            logger.warning(f"Database save failed, using generated UUID: {report_id}")
        
        return ReportUploadResponse(
            report_id=report_id,
            file_name=file.filename or "report",
            file_path=upload_result.get("file_path", ""),
            file_type=file.content_type or "unknown",
            file_size=len(file_bytes),
            ocr_text=ocr_result.get("ocr_text", ""),
            structured_data=ocr_result.get("structured_data", {}),
            specialist_type=specialist_type,
            report_type="other",
            status="completed",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{report_id}")
async def get_report(report_id: str):
    """Get report details and analysis"""
    try:
        db_service = DatabaseService()
        result = await db_service.get_report_by_id(report_id)
        
        if result.get("success"):
            return result["data"]
        else:
            raise HTTPException(status_code=404, detail=result.get("error", "Report not found"))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get report error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{report_id}")
async def delete_report(report_id: str):
    """Delete report"""
    # Will be implemented later
    raise HTTPException(status_code=501, detail="Not yet implemented")
