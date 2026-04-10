"""
Blood Pressure Estimation Router
=================================
Endpoint for AI-based BP estimation from face video.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import logging
from app.services.bp_estimation_service import process_video_frames

router = APIRouter()
logger = logging.getLogger(__name__)


class BPEstimationRequest(BaseModel):
    frames: List[str]  # Base64 encoded frames
    duration: int = 30  # Duration in seconds


@router.post("/estimate")
async def estimate_blood_pressure(request: BPEstimationRequest):
    """
    Estimate blood pressure from face video frames using rPPG.
    """
    logger.info(f"Received BP estimation request with {len(request.frames)} frames")
    
    if len(request.frames) < 10:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient frames. Received {len(request.frames)}, need at least 10. Please record for 30 seconds."
        )
    
    # Process frames
    result = await process_video_frames(request.frames, request.duration)
    
    logger.info(f"BP estimation result: {result}")
    
    if not result.get("success"):
        raise HTTPException(
            status_code=400,
            detail=result.get("error", "Failed to estimate blood pressure")
        )
    
    return result
