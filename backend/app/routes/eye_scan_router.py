"""
Neurological Eye Scan Router
=============================
Endpoint for AI-based neurological screening from eye movement video.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import logging
from app.services.eye_scan_service import process_eye_scan

router = APIRouter()
logger = logging.getLogger(__name__)


class EyeScanRequest(BaseModel):
    frames: List[str]  # Base64 encoded frames
    duration: int = 30  # Duration in seconds


@router.post("/neurological")
async def neurological_eye_scan(request: EyeScanRequest):
    """
    Analyze eye movements from video frames to screen for neurological disorders.
    """
    logger.info(f"Received eye scan request with {len(request.frames)} frames")
    
    if len(request.frames) < 10:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient frames. Received {len(request.frames)}, need at least 10. Please record for 30 seconds."
        )
    
    # Process frames
    result = await process_eye_scan(request.frames, request.duration)
    
    logger.info(f"Eye scan result: {result}")
    
    if not result.get("success"):
        raise HTTPException(
            status_code=400,
            detail=result.get("error", "Failed to analyze eye movements")
        )
    
    return result
