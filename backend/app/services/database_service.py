"""
Database Service
=================
Handle all database operations with Supabase.
"""

import os
import logging
from typing import Dict, Any, Optional, List
from supabase import create_client, Client

logger = logging.getLogger(__name__)


class DatabaseService:
    """Service for database operations"""
    
    def __init__(self):
        """Initialize Supabase client"""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not configured")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    async def save_report_analysis(
        self,
        user_id: str,
        file_name: str,
        file_path: str,
        file_type: str,
        file_size: int,
        ocr_text: str,
        structured_data: Dict[str, Any],
        specialist_type: str,
        report_type: str = "other"
    ) -> Dict[str, Any]:
        """
        Save medical report and analysis to database.
        
        Returns:
            Dictionary with report_id and status
        """
        try:
            # Ensure user profile exists (create if not exists)
            self.supabase.table("profiles").upsert({
                "id": user_id,
                "email": f"{user_id}@dev.local",
                "full_name": "Development User"
            }, on_conflict="id").execute()
            
            # Insert into medical_reports table
            response = self.supabase.table("medical_reports").insert({
                "user_id": user_id,
                "file_name": file_name,
                "file_path": file_path,
                "file_type": file_type,
                "file_size": file_size,
                "ocr_text": ocr_text,
                "structured_data": structured_data,
                "specialist_type": specialist_type,
                "report_type": report_type,
                "status": "completed"
            }).execute()
            
            report_id = response.data[0]["id"] if response.data else None
            
            return {
                "report_id": report_id,
                "success": True,
                "data": response.data[0] if response.data else None
            }
        except Exception as e:
            logger.error(f"Error saving report analysis: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def save_image_analysis(
        self,
        user_id: str,
        file_name: str,
        file_path: str,
        image_url: str,
        file_size: int,
        image_type: str,
        ml_results: Dict[str, Any],
        specialist_type: str
    ) -> Dict[str, Any]:
        """
        Save medical image and analysis to database.
        
        Returns:
            Dictionary with image_id and status
        """
        try:
            # Ensure user profile exists (create if not exists)
            self.supabase.table("profiles").upsert({
                "id": user_id,
                "email": f"{user_id}@dev.local",
                "full_name": "Development User"
            }, on_conflict="id").execute()
            
            # Clean ml_results for database (remove non-serializable data)
            clean_ml_results = {
                "analysis_text": ml_results.get("analysis_text", ""),
                "image_type": ml_results.get("image_type", image_type),
                "specialist_type": ml_results.get("specialist_type", specialist_type),
                "success": ml_results.get("success", True),
                "error": ml_results.get("error")
            }
            
            # Insert into medical_images table
            # Use base64 image URL if storage upload failed
            final_image_url = image_url if image_url and not image_url.startswith("data:image/png;base64,mock") else ml_results.get("image_base64", image_url)
            
            response = self.supabase.table("medical_images").insert({
                "user_id": user_id,
                "file_name": file_name,
                "file_path": file_path,
                "image_url": final_image_url,
                "file_size": file_size,
                "image_type": image_type,
                "ml_analysis_result": clean_ml_results,
                "specialist_type": specialist_type,
                "status": "completed"
            }).execute()
            
            image_id = response.data[0]["id"] if response.data else None
            
            return {
                "image_id": image_id,
                "success": True,
                "data": response.data[0] if response.data else None
            }
        except Exception as e:
            logger.error(f"Error saving image analysis: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_report_by_id(self, report_id: str) -> Dict[str, Any]:
        """Get report by ID"""
        try:
            response = self.supabase.table("medical_reports").select("*").eq("id", report_id).execute()
            
            if response.data:
                return {
                    "success": True,
                    "data": response.data[0]
                }
            else:
                return {
                    "success": False,
                    "error": "Report not found"
                }
        except Exception as e:
            logger.error(f"Error getting report: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_image_by_id(self, image_id: str) -> Dict[str, Any]:
        """Get image by ID"""
        try:
            response = self.supabase.table("medical_images").select("*").eq("id", image_id).execute()
            
            if response.data:
                return {
                    "success": True,
                    "data": response.data[0]
                }
            else:
                return {
                    "success": False,
                    "error": "Image not found"
                }
        except Exception as e:
            logger.error(f"Error getting image: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def save_ai_analysis(
        self,
        user_id: str,
        workflow_type: str,
        report_id: Optional[str],
        image_id: Optional[str],
        specialist_type: str,
        analysis_text: str,
        diagnosis_summary: str,
        recommendations: List[str],
        confidence_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """Save AI analysis to database"""
        try:
            response = self.supabase.table("ai_analyses").insert({
                "user_id": user_id,
                "workflow_type": workflow_type,
                "report_id": report_id,
                "image_id": image_id,
                "specialist_type": specialist_type,
                "analysis_text": analysis_text,
                "diagnosis_summary": diagnosis_summary,
                "recommendations": recommendations,
                "confidence_score": confidence_score
            }).execute()
            
            analysis_id = response.data[0]["id"] if response.data else None
            
            return {
                "analysis_id": analysis_id,
                "success": True,
                "data": response.data[0] if response.data else None
            }
        except Exception as e:
            logger.error(f"Error saving AI analysis: {e}")
            return {
                "success": False,
                "error": str(e)
            }
