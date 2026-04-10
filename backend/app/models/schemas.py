"""
Pydantic Models for AI Doctor Platform
======================================
Request and response schemas for all API endpoints.
Supports both workflows:
- Workflow 1: Dedicated Upload & Analysis
- Workflow 2: Chat-Integrated Analysis
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum


# ============================================
# Enums
# ============================================

class SpecialistType(str, Enum):
    """Available specialist types"""
    GENERAL_PHYSICIAN = "general-physician"
    CARDIOLOGIST = "cardiologist-specialist"
    DERMATOLOGIST = "dermatologist-specialist"
    ENT_SPECIALIST = "ent-specialist"
    EYE_SPECIALIST = "eye-specialist"
    ORTHOPEDIC = "orthopedic-specialist"
    DENTIST = "dentist-specialist"
    PEDIATRICIAN = "pediatrician-specialist"
    PHARMACY = "pharmacy-assistant"
    NUTRITIONIST = "nutritionist-specialist"


class ImageType(str, Enum):
    """Medical image types"""
    XRAY = "xray"
    SKIN = "skin"
    ORAL = "oral"
    POSTURE = "posture"
    RETINA = "retina"
    OTHER = "other"


class ReportType(str, Enum):
    """Medical report types"""
    BLOOD = "blood"
    URINE = "urine"
    XRAY = "xray"
    MRI = "mri"
    CT_SCAN = "ct_scan"
    ULTRASOUND = "ultrasound"
    OTHER = "other"


class WorkflowType(str, Enum):
    """Analysis workflow types"""
    DEDICATED = "dedicated"
    CHAT = "chat"


class FileStatus(str, Enum):
    """File processing status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ============================================
# Chat Models (Workflow 2)
# ============================================

class ChatRequest(BaseModel):
    """Request for regular chat"""
    message: str = Field(..., min_length=1, max_length=5000, description="User's message")
    agent_id: str = Field(..., description="Specialist agent ID")
    session_id: Optional[str] = Field(None, description="Chat session ID")


class ChatResponse(BaseModel):
    """Response from chat"""
    response: str
    session_id: str
    sources: Optional[List[str]] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    triage: Optional[Dict[str, Any]] = None


class ChatMessageSchema(BaseModel):
    """Chat message for database"""
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)


# ============================================
# File Upload Models (Both Workflows)
# ============================================

class FileUploadResponse(BaseModel):
    """Generic file upload response"""
    file_id: str
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    public_url: str
    status: str
    created_at: datetime = Field(default_factory=datetime.now)


# ============================================
# Report Upload Models (Workflow 1)
# ============================================

class ReportUploadResponse(BaseModel):
    """Response after uploading medical report"""
    report_id: str
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    ocr_text: Optional[str]
    structured_data: Optional[Dict[str, Any]]
    specialist_type: str
    report_type: str
    status: str
    created_at: datetime = Field(default_factory=datetime.now)


class ReportAnalysisRequest(BaseModel):
    """Request to analyze uploaded report"""
    report_id: str
    specialist_type: str
    symptoms: Optional[str] = None


class ReportAnalysisResponse(BaseModel):
    """Response after report analysis"""
    analysis_id: str
    report_id: str
    specialist_type: str
    analysis_text: str
    diagnosis_summary: str
    recommendations: List[str]
    confidence_score: Optional[float]
    created_at: datetime = Field(default_factory=datetime.now)


# ============================================
# Image Upload Models (Workflow 1)
# ============================================

class ImageUploadResponse(BaseModel):
    """Response after uploading medical image"""
    image_id: str
    file_name: str
    file_path: str
    image_type: str
    image_url: str
    file_size: int
    ml_results: Optional[Dict[str, Any]]
    specialist_type: str
    status: str
    created_at: datetime = Field(default_factory=datetime.now)


class ImageAnalysisRequest(BaseModel):
    """Request to analyze uploaded image"""
    image_id: str
    image_type: str
    specialist_type: str
    symptoms: Optional[str] = None


class ImageAnalysisResponse(BaseModel):
    """Response after image analysis"""
    analysis_id: str
    image_id: str
    ml_results: Dict[str, Any]
    ai_explanation: str
    recommendations: List[str]
    confidence_score: Optional[float]
    created_at: datetime = Field(default_factory=datetime.now)


class WebcamCaptureRequest(BaseModel):
    """Request for webcam capture"""
    image_data: str = Field(..., description="Base64 encoded image")
    image_type: str
    specialist_type: str


# ============================================
# Chat with File Upload (Workflow 2)
# ============================================

class ChatWithFileRequest(BaseModel):
    """Request for chat with file upload"""
    file: str  # Will be handled as FormData
    agent_id: str
    message: str = Field("Please analyze this", description="User's message about the file")
    session_id: Optional[str] = None


class ChatWithFileResponse(BaseModel):
    """Response from chat with file"""
    response: str
    session_id: str
    attachment: Optional[Dict[str, Any]] = None
    triage: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.now)


# ============================================
# Multi-Modal Analysis Models
# ============================================

class MultiModalAnalysisRequest(BaseModel):
    """Request for multi-modal analysis"""
    report_ids: Optional[List[str]] = []
    image_ids: Optional[List[str]] = []
    symptoms: str = Field(..., min_length=1, max_length=5000)
    specialist_type: str


class ComprehensiveReport(BaseModel):
    """Comprehensive health report"""
    analysis_id: str
    user_id: str
    specialist_type: str
    summary: str
    findings: List[Dict[str, Any]]
    recommendations: Dict[str, List[str]]
    lifestyle_advice: str
    pdf_url: Optional[str]
    created_at: datetime = Field(default_factory=datetime.now)


# ============================================
# History Models
# ============================================

class ConsultationRecord(BaseModel):
    """Consultation history record"""
    id: str
    workflow_type: str
    specialist_type: str
    symptoms: Optional[str]
    report_count: int
    image_count: int
    ai_summary: Optional[str]
    created_at: datetime


class ConsultationDetail(BaseModel):
    """Detailed consultation record"""
    id: str
    workflow_type: str
    specialist_type: str
    symptoms: Optional[str]
    reports: List[Dict[str, Any]]
    images: List[Dict[str, Any]]
    ai_analysis: Optional[Dict[str, Any]]
    final_report: Optional[str]
    created_at: datetime


# ============================================
# Auth Models
# ============================================

class UserSignup(BaseModel):
    """User signup request"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    """User profile response"""
    id: str
    email: str
    full_name: Optional[str]
    date_of_birth: Optional[str]
    gender: Optional[str]
    phone: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime


class UserProfileUpdate(BaseModel):
    """User profile update request"""
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None


class TokenResponse(BaseModel):
    """Authentication token response"""
    access_token: str
    token_type: str
    user: UserProfile


# ============================================
# Common Response Models
# ============================================

class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Generic error response"""
    success: bool = False
    error: str
    detail: Optional[str] = None
