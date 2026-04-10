# AI Doctor Platform - Complete Implementation Plan (Part 2)

## Phase 2: Backend Core Services (Continued)

---

### Step 2.2: Create Base AI Agent Class

**Action:** Create the base class for all 10 specialist AI agents

**File:** `backend/app/agents/base_agent.py`

```python
"""
Base Medical Agent Class
=========================
Abstract base class for all specialist AI agents.
Uses Google Gemini API for natural language processing.
"""

import os
import json
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from datetime import datetime


class BaseMedicalAgent(ABC):
    """
    Base class for all medical specialist agents.
    
    Each specialist (Cardiologist, Dermatologist, etc.) inherits from this class
    and provides specialty-specific instructions and tools.
    """
    
    def __init__(self, name: str, agent_id: str, instructions: str, tools: Optional[List[Dict]] = None):
        """
        Initialize a medical specialist agent.
        
        Args:
            name: Display name of the specialist (e.g., "Cardiologist")
            agent_id: Unique identifier (e.g., "cardiologist-specialist")
            instructions: System instructions defining the agent's behavior
            tools: Optional list of tool definitions
        """
        self.name = name
        self.agent_id = agent_id
        self.instructions = instructions
        self.tools = tools or []
        
        # Configure Gemini API
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY not configured in environment variables")
        
        genai.configure(api_key=gemini_api_key)
        
        # Initialize Gemini model
        model_name = os.getenv("DEFAULT_GEMINI_MODEL", "gemini-2.0-flash")
        self.model = genai.GenerativeModel(model_name)
        
        # Conversation history for context
        self.conversation_history: List[Dict[str, str]] = []
    
    def _build_prompt(self, user_message: str, context: Optional[str] = None) -> str:
        """
        Build the complete prompt for the AI.
        
        Args:
            user_message: User's input message
            context: Optional additional context (lab results, image analysis, etc.)
        
        Returns:
            Complete formatted prompt
        """
        prompt = f"""{self.instructions}

Current Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        if context:
            prompt += f"\n=== CONTEXT ===\n{context}\n=== END CONTEXT ===\n"
        
        prompt += f"\n=== PATIENT MESSAGE ===\n{user_message}\n=== END PATIENT MESSAGE ==="
        
        return prompt
    
    async def run(self, user_message: str, context: Optional[str] = None) -> str:
        """
        Run the agent with user message.
        
        Args:
            user_message: User's input message
            context: Optional context (file analysis results, symptoms, etc.)
        
        Returns:
            AI agent's response
        """
        # Build complete prompt
        prompt = self._build_prompt(user_message, context)
        
        # Add to conversation history
        self.conversation_history.append({
            "role": "user",
            "content": user_message,
            "timestamp": datetime.now().isoformat()
        })
        
        try:
            # Generate response using Gemini
            response = await self.model.generate_content_async(prompt)
            ai_response = response.text
            
            # Add to conversation history
            self.conversation_history.append({
                "role": "assistant",
                "content": ai_response,
                "timestamp": datetime.now().isoformat()
            })
            
            return ai_response
            
        except Exception as e:
            error_message = f"I apologize, but I encountered an error processing your request: {str(e)}"
            return error_message
    
    def run_with_file(self, user_message: str, file_context: Dict[str, Any]) -> str:
        """
        Run agent with file analysis context.
        
        Args:
            user_message: User's message about the file
            file_context: Dictionary with file analysis results
        
        Returns:
            AI agent's response analyzing the file
        """
        # Build context from file analysis
        context_parts = []
        
        if file_context.get('file_type'):
            context_parts.append(f"File Type: {file_context['file_type']}")
        
        if file_context.get('file_name'):
            context_parts.append(f"File Name: {file_context['file_name']}")
        
        if file_context.get('ml_results'):
            context_parts.append(f"ML Analysis Results:\n{json.dumps(file_context['ml_results'], indent=2)}")
        
        if file_context.get('ocr_text'):
            context_parts.append(f"Extracted Text:\n{file_context['ocr_text']}")
        
        if file_context.get('structured_data'):
            context_parts.append(f"Structured Data:\n{json.dumps(file_context['structured_data'], indent=2)}")
        
        context = "\n\n".join(context_parts)
        
        return self.run(user_message, context)
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_history(self) -> List[Dict[str, str]]:
        """Get conversation history"""
        return self.conversation_history
    
    @abstractmethod
    def get_specialty_info(self) -> Dict[str, Any]:
        """
        Return specialty-specific information.
        
        Returns:
            Dictionary with description, icon, common conditions, etc.
        """
        pass
```

---

### Step 2.3: Create Agent Registry

**Action:** Create registry to manage all 10 specialist agents

**File:** `backend/app/agents/registry.py`

```python
"""
AI Agent Registry
==================
Central registry for all specialist AI agents.
Provides functions to get agent instances and list all available agents.
"""

from typing import Dict, Type
from app.agents.base_agent import BaseMedicalAgent
from app.agents.specialists.general_physician_agent import GeneralPhysicianAgent
from app.agents.specialists.cardiologist_agent import CardiologistAgent
from app.agents.specialists.dermatologist_agent import DermatologistAgent
from app.agents.specialists.ent_specialist_agent import ENTSpecialistAgent
from app.agents.specialists.eye_specialist_agent import EyeSpecialistAgent
from app.agents.specialists.orthopedic_agent import OrthopedicAgent
from app.agents.specialists.dentist_agent import DentistAgent
from app.agents.specialists.pediatrician_agent import PediatricianAgent
from app.agents.specialists.pharmacy_agent import PharmacyAgent
from app.agents.specialists.nutritionist_agent import NutritionistAgent


# Agent registry mapping agent_id to agent class
AGENT_REGISTRY: Dict[str, Type[BaseMedicalAgent]] = {
    "general-physician": GeneralPhysicianAgent,
    "cardiologist-specialist": CardiologistAgent,
    "dermatologist-specialist": DermatologistAgent,
    "ent-specialist": ENTSpecialistAgent,
    "eye-specialist": EyeSpecialistAgent,
    "orthopedic-specialist": OrthopedicAgent,
    "dentist-specialist": DentistAgent,
    "pediatrician-specialist": PediatricianAgent,
    "pharmacy-assistant": PharmacyAgent,
    "nutritionist-specialist": NutritionistAgent,
}


def get_agent(agent_id: str) -> BaseMedicalAgent:
    """
    Get an agent instance by ID.
    
    Args:
        agent_id: Specialist agent ID (e.g., "cardiologist-specialist")
    
    Returns:
        Initialized agent instance
    
    Raises:
        ValueError: If agent_id is not found
    """
    agent_class = AGENT_REGISTRY.get(agent_id)
    if not agent_class:
        available_agents = ", ".join(AGENT_REGISTRY.keys())
        raise ValueError(f"Agent '{agent_id}' not found. Available agents: {available_agents}")
    return agent_class()


def get_all_agents() -> Dict[str, Dict[str, Any]]:
    """
    Get information about all available agents.
    
    Returns:
        Dictionary mapping agent_id to agent info
    """
    agents_info = {}
    for agent_id, agent_class in AGENT_REGISTRY.items():
        try:
            agent = agent_class()
            agents_info[agent_id] = {
                "name": agent.name,
                "agent_id": agent_id,
                **agent.get_specialty_info()
            }
        except Exception as e:
            agents_info[agent_id] = {
                "name": "Error loading agent",
                "error": str(e)
            }
    return agents_info


def list_specialists() -> list:
    """
    Get list of all specialist names.
    
    Returns:
        List of specialist display names
    """
    return [info["name"] for info in get_all_agents().values()]
```

---

### Step 2.4: Create 10 Specialist Agents

**Action:** Create all 10 specialist agent files with instructions from existing Supabase function

I'll create the first agent as an example. You'll create the remaining 9 following the same pattern.

**File:** `backend/app/agents/specialists/cardiologist_agent.py`

```python
"""
Cardiologist AI Agent
======================
Expert cardiologist specializing in heart and cardiovascular health.
"""

from app.agents.base_agent import BaseMedicalAgent
from typing import Dict, Any


class CardiologistAgent(BaseMedicalAgent):
    """
    Expert Cardiologist AI assistant specializing in heart and cardiovascular health.
    
    Expertise Areas:
    - Heart conditions (arrhythmias, heart failure, coronary artery disease)
    - Blood pressure and circulation issues
    - Cardiovascular risk assessment
    - Heart-healthy lifestyle recommendations
    """
    
    def __init__(self):
        instructions = """You are an expert Cardiologist AI assistant specializing in heart and cardiovascular health.

=== YOUR EXPERTISE ===

**Expertise Areas:**
- Heart conditions (arrhythmias, heart failure, coronary artery disease)
- Blood pressure and circulation issues
- Cardiovascular risk assessment
- Heart-healthy lifestyle recommendations

**Your Approach:**
- Assess cardiovascular symptoms with precision
- Explain heart conditions and treatments clearly
- Provide evidence-based cardiovascular health advice
- Emphasize lifestyle factors (diet, exercise, stress management)

**Clinical Focus:**
- Recognize cardiac emergency symptoms (chest pain, shortness of breath)
- Discuss diagnostic tests (ECG, echocardiogram, stress tests)
- Explain medications for heart conditions
- Preventive cardiology and risk reduction

=== IMPORTANT SAFETY GUIDELINES ===

**EMERGENCY RECOGNITION:**
For chest pain, severe shortness of breath, or signs of heart attack, IMMEDIATELY advise calling emergency services (911 or local emergency number).

**DISCLAIMERS:**
- You provide educational information, NOT diagnoses
- Always recommend consulting healthcare professionals for actual medical decisions
- Never recommend specific medications without proper medical consultation
- In emergencies, direct to call emergency services immediately

=== SPECIALIST REFERRALS ===

If a patient asks about non-cardiac issues, politely redirect them:
- Skin problems → Dermatologist
- Bone/joint injuries → Orthopedic Surgeon
- Dental issues → Dentist
- Eye problems → Eye Specialist
- ENT concerns → ENT Specialist
- Children's health → Pediatrician
- Nutrition advice → Nutritionist
- Medication queries → Pharmacy Assistant
- General health → General Practitioner

=== COMMUNICATION STYLE ===

- Professional yet empathetic
- Use clear, non-technical language when possible
- Explain medical terms when necessary
- Ask clarifying questions about symptoms
- Provide actionable advice
- Always prioritize patient safety"""

        super().__init__(
            name="Cardiologist",
            agent_id="cardiologist-specialist",
            instructions=instructions,
        )
    
    def get_specialty_info(self) -> Dict[str, Any]:
        """Return specialty-specific information"""
        return {
            "description": "Expert in heart health, diagnosing and managing cardiovascular conditions with precision",
            "icon": "FaHeartbeat",
            "common_conditions": [
                "Hypertension (High Blood Pressure)",
                "Coronary Artery Disease",
                "Arrhythmias",
                "Heart Failure",
                "Valve Disorders",
                "Congenital Heart Defects"
            ],
            "diagnostic_tests": [
                "ECG/EKG",
                "Echocardiogram",
                "Stress Test",
                "Holter Monitor",
                "Cardiac Catheterization"
            ],
            "emergency_symptoms": [
                "Chest pain or pressure",
                "Severe shortness of breath",
                "Pain radiating to arm, jaw, or back",
                "Sudden dizziness or fainting"
            ]
        }
```

**Now create the remaining 9 agents following the same pattern:**

Create these files (copy the structure above and change the instructions):

1. `general_physician_agent.py`
2. `dermatologist_agent.py`
3. `ent_specialist_agent.py`
4. `eye_specialist_agent.py`
5. `orthopedic_agent.py`
6. `dentist_agent.py`
7. `pediatrician_agent.py`
8. `pharmacy_agent.py`
9. `nutritionist_agent.py`

**For each agent, use the instructions from** `supabase/functions/chat/index.ts` **file.**

---

### Step 2.5: Implement OCR Service

**Action:** Create service for extracting text from PDFs and images

**File:** `backend/app/services/ocr_service.py`

```python
"""
OCR Service
============
Extract text from medical reports (PDFs and images) using PyTesseract and pdfplumber.
"""

import io
import logging
from typing import Dict, Any, List
import pytesseract
import pdfplumber
from PIL import Image
import re
import json

logger = logging.getLogger(__name__)


class OCRService:
    """
    Service for extracting text from medical reports.
    
    Supports:
    - PDF files (using pdfplumber)
    - Image files (using PyTesseract)
    - Structured data parsing (lab values, etc.)
    """
    
    @staticmethod
    async def extract_text_from_pdf(file_bytes: bytes) -> str:
        """
        Extract text from PDF using pdfplumber.
        
        Args:
            file_bytes: Raw PDF file bytes
        
        Returns:
            Extracted text content
        """
        try:
            text = ""
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise
    
    @staticmethod
    async def extract_text_from_image(image_bytes: bytes, lang: str = 'eng') -> str:
        """
        Extract text from image using PyTesseract.
        
        Args:
            image_bytes: Raw image file bytes
            lang: OCR language (default: English)
        
        Returns:
            Extracted text content
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(image, lang=lang)
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from image: {e}")
            raise
    
    @staticmethod
    async def process_medical_report(file_bytes: bytes, file_type: str) -> Dict[str, Any]:
        """
        Process medical report and extract structured data.
        
        Args:
            file_bytes: Raw file bytes
            file_type: MIME type of the file
        
        Returns:
            Dictionary with OCR text and structured data
        """
        try:
            # Extract text based on file type
            if 'pdf' in file_type:
                ocr_text = await OCRService.extract_text_from_pdf(file_bytes)
            elif 'image' in file_type:
                ocr_text = await OCRService.extract_text_from_image(file_bytes)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
            # Parse structured data from OCR text
            structured_data = OCRService._parse_lab_values(ocr_text)
            
            return {
                "ocr_text": ocr_text,
                "structured_data": structured_data,
                "word_count": len(ocr_text.split()),
                "character_count": len(ocr_text),
                "success": True
            }
        except Exception as e:
            logger.error(f"Error processing medical report: {e}")
            return {
                "error": str(e),
                "success": False
            }
    
    @staticmethod
    def _parse_lab_values(text: str) -> Dict[str, Any]:
        """
        Parse lab values from OCR text.
        
        Extracts common lab test patterns like:
        - Hemoglobin: 14.5 g/dL
        - WBC: 7,500 /μL
        - Glucose: 95 mg/dL
        
        Args:
            text: OCR extracted text
        
        Returns:
            Dictionary with parsed lab tests
        """
        structured = {
            "tests": [],
            "abnormal_values": [],
            "normal_ranges": []
        }
        
        # Common lab test patterns
        lab_patterns = [
            r'([A-Za-z\s]+):\s*([\d.,]+)\s*([A-Za-z/μLmgdL]+)',
            r'([A-Za-z\s]+)\s+([\d.,]+)\s+([A-Za-z/μLmgdL]+)',
        ]
        
        for pattern in lab_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                test_name, value, unit = match
                structured["tests"].append({
                    "name": test_name.strip(),
                    "value": value,
                    "unit": unit
                })
        
        # Common abnormal value indicators
        abnormal_indicators = ['high', 'low', 'abnormal', 'elevated', 'decreased']
        for indicator in abnormal_indicators:
            if indicator in text.lower():
                structured["abnormal_values"].append(indicator)
        
        return structured
```

---

### Step 2.6: Implement Image Analysis Service

**Action:** Create service for analyzing medical images with ML models

**File:** `backend/app/services/image_analysis_service.py`

```python
"""
Image Analysis Service
=======================
Analyze medical images using ML models.
Supports: X-ray, skin lesions, oral health, posture analysis.
"""

import io
import logging
from typing import Dict, Any, List
from PIL import Image
import numpy as np

logger = logging.getLogger(__name__)


class ImageAnalysisService:
    """
    Service for analyzing medical images using ML models.
    
    Supports:
    - X-ray analysis (lung abnormalities, fractures)
    - Skin lesion analysis (benign/malignant detection)
    - Oral health analysis (dental issues)
    - Posture analysis (pose estimation with MediaPipe)
    """
    
    def __init__(self):
        """Initialize ML models"""
        # Note: In production, load actual models from HuggingFace
        # Example:
        # from transformers import AutoImageProcessor, AutoModelForImageClassification
        # self.xray_processor = AutoImageProcessor.from_pretrained("...")
        # self.xray_model = AutoModelForImageClassification.from_pretrained("...")
        pass
    
    async def analyze_xray(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Analyze X-ray image for abnormalities.
        
        Args:
            image_bytes: Raw X-ray image bytes
        
        Returns:
            Dictionary with findings and confidence scores
        """
        try:
            # Load image
            image = Image.open(io.BytesIO(image_bytes))
            
            # TODO: Implement actual X-ray analysis model
            # For now, return mock results for development
            
            return {
                "findings": [
                    {
                        "type": "lung_opacity",
                        "location": "right_lower_lobe",
                        "confidence": 0.85,
                        "description": "Increased opacity observed in right lower lobe, possible pneumonia"
                    }
                ],
                "summary": "Possible pneumonia in right lower lobe",
                "recommendation": "Clinical correlation recommended. Consider follow-up imaging.",
                "confidence_score": 0.85,
                "success": True
            }
        except Exception as e:
            logger.error(f"Error analyzing X-ray: {e}")
            return {
                "error": str(e),
                "success": False
            }
    
    async def analyze_skin_lesion(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Analyze skin image for lesions/abnormalities.
        
        Args:
            image_bytes: Raw skin image bytes
        
        Returns:
            Dictionary with lesion analysis
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            
            # TODO: Implement actual skin lesion analysis
            return {
                "findings": [
                    {
                        "type": "pigmented_lesion",
                        "location": {"x": 150, "y": 200, "width": 50, "height": 50},
                        "confidence": 0.78,
                        "characteristics": {
                            "asymmetry": "low",
                            "border": "regular",
                            "color": "uniform",
                            "diameter_mm": 5
                        }
                    }
                ],
                "summary": "Benign-appearing pigmented lesion",
                "recommendation": "Monitor for changes; consult dermatologist if concerned",
                "confidence_score": 0.78,
                "success": True
            }
        except Exception as e:
            logger.error(f"Error analyzing skin lesion: {e}")
            return {
                "error": str(e),
                "success": False
            }
    
    async def analyze_oral_health(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Analyze oral/dental images.
        
        Args:
            image_bytes: Raw oral image bytes
        
        Returns:
            Dictionary with dental findings
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            
            # TODO: Implement actual dental analysis
            return {
                "findings": [
                    {
                        "type": "dental_caries",
                        "location": "tooth_36_occlusal",
                        "confidence": 0.72,
                        "description": "Possible cavity on occlusal surface"
                    }
                ],
                "summary": "Possible dental caries detected",
                "recommendation": "Schedule dental examination",
                "confidence_score": 0.72,
                "success": True
            }
        except Exception as e:
            logger.error(f"Error analyzing oral health: {e}")
            return {
                "error": str(e),
                "success": False
            }
    
    async def analyze_posture(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Analyze posture using MediaPipe.
        
        Args:
            image_bytes: Raw posture image bytes
        
        Returns:
            Dictionary with posture analysis and exercise recommendations
        """
        try:
            import mediapipe as mp
            
            image = Image.open(io.BytesIO(image_bytes))
            image_np = np.array(image)
            
            # Initialize MediaPipe Pose
            mp_pose = mp.solutions.pose
            pose = mp_pose.Pose(static_image_mode=True)
            
            # Detect pose landmarks
            results = pose.process(image_np)
            
            if not results.pose_landmarks:
                return {
                    "error": "No pose landmarks detected",
                    "recommendation": "Ensure full body is visible in the image",
                    "success": False
                }
            
            # Calculate joint angles
            landmarks = results.pose_landmarks.landmark
            
            # Example: Calculate shoulder angle
            shoulder_angle = self._calculate_angle(
                landmarks[mp_pose.PoseLandmark.NOSE],
                landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER],
                landmarks[mp_pose.PoseLandmark.LEFT_HIP]
            )
            
            # Analyze posture issues
            issues = []
            exercises = []
            
            if shoulder_angle > 55:  # Forward head posture
                issues.append({
                    "type": "forward_head_posture",
                    "severity": "moderate",
                    "description": "Head positioned forward of ideal alignment"
                })
                exercises.append({
                    "name": "Chin Tucks",
                    "reps": "10 reps, hold 5 seconds",
                    "frequency": "3 times daily"
                })
            
            return {
                "landmarks_detected": True,
                "joint_angles": {
                    "shoulder_angle": shoulder_angle,
                },
                "issues": issues,
                "exercises": exercises,
                "summary": self._generate_posture_summary(issues),
                "confidence_score": 0.80,
                "success": True
            }
        except Exception as e:
            logger.error(f"Error analyzing posture: {e}")
            return {
                "error": str(e),
                "success": False
            }
    
    def _calculate_angle(self, a, b, c) -> float:
        """
        Calculate angle between three points.
        
        Args:
            a, b, c: Landmark points with x, y attributes
        
        Returns:
            Angle in degrees
        """
        a = np.array([a.x, a.y])
        b = np.array([b.x, b.y])
        c = np.array([c.x, c.y])
        
        ba = a - b
        bc = c - b
        
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.arccos(cosine_angle)
        
        return np.degrees(angle)
    
    def _generate_posture_summary(self, issues: list) -> str:
        """
        Generate human-readable posture summary.
        
        Args:
            issues: List of detected posture issues
        
        Returns:
            Summary string
        """
        if not issues:
            return "Posture appears within normal limits"
        
        issue_types = [i["type"] for i in issues]
        return f"Posture analysis detected: {', '.join(issue_types)}. Recommended exercises provided."
```

---

### Step 2.7: Implement File Service

**Action:** Create service for file uploads to Supabase Storage

**File:** `backend/app/services/file_service.py`

```python
"""
File Service
=============
Handle file uploads, downloads, and management with Supabase Storage.
"""

import os
import logging
from typing import Dict, Any, Optional
from supabase import create_client, Client
import uuid
import base64

logger = logging.getLogger(__name__)


class FileService:
    """
    Service for handling file operations with Supabase Storage.
    
    Supports:
    - File upload to storage buckets
    - File download
    - File deletion
    - Public URL generation
    - Base64 image upload
    """
    
    def __init__(self):
        """Initialize Supabase client"""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not configured in environment variables")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    async def upload_file(
        self,
        file_bytes: bytes,
        file_name: str,
        bucket: str,
        user_id: str,
        file_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload file to Supabase Storage.
        
        Args:
            file_bytes: Raw file bytes
            file_name: Original file name
            bucket: Storage bucket name (medical-images, medical-reports)
            user_id: User ID for folder organization
            file_type: MIME type of the file
        
        Returns:
            Dictionary with file path and URL
        """
        try:
            # Create user-specific folder path
            unique_id = uuid.uuid4()
            file_path = f"{user_id}/{unique_id}_{file_name}"
            
            # Upload to Supabase
            response = self.supabase.storage.from_(bucket).upload(
                file_path,
                file_bytes,
                {"content-type": file_type or "application/octet-stream"}
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_(bucket).get_public_url(file_path)
            
            return {
                "file_path": file_path,
                "file_name": file_name,
                "bucket": bucket,
                "public_url": public_url,
                "file_size": len(file_bytes),
                "success": True
            }
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            return {
                "error": str(e),
                "success": False
            }
    
    async def download_file(self, file_path: str, bucket: str) -> bytes:
        """
        Download file from Supabase Storage.
        
        Args:
            file_path: Path to file in storage
            bucket: Storage bucket name
        
        Returns:
            Raw file bytes
        """
        try:
            response = self.supabase.storage.from_(bucket).download(file_path)
            return response
        except Exception as e:
            logger.error(f"Error downloading file: {e}")
            raise
    
    async def delete_file(self, file_path: str, bucket: str) -> bool:
        """
        Delete file from storage.
        
        Args:
            file_path: Path to file in storage
            bucket: Storage bucket name
        
        Returns:
            True if successful
        """
        try:
            response = self.supabase.storage.from_(bucket).remove([file_path])
            return True
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return False
    
    def get_public_url(self, file_path: str, bucket: str) -> str:
        """
        Get public URL for stored file.
        
        Args:
            file_path: Path to file in storage
            bucket: Storage bucket name
        
        Returns:
            Public URL
        """
        try:
            return self.supabase.storage.from_(bucket).get_public_url(file_path)
        except Exception as e:
            logger.error(f"Error getting public URL: {e}")
            raise
    
    async def upload_base64_image(
        self,
        base64_data: str,
        file_name: str,
        bucket: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Upload base64-encoded image.
        
        Args:
            base64_data: Base64 encoded image data
            file_name: File name
            bucket: Storage bucket name
            user_id: User ID for folder organization
        
        Returns:
            Dictionary with upload result
        """
        try:
            # Decode base64
            # Handle both formats: with and without data:image prefix
            if ',' in base64_data:
                file_bytes = base64.b64decode(base64_data.split(',')[1])
            else:
                file_bytes = base64.b64decode(base64_data)
            
            # Upload
            return await self.upload_file(
                file_bytes=file_bytes,
                file_name=file_name,
                bucket=bucket,
                user_id=user_id,
                file_type="image/jpeg"
            )
        except Exception as e:
            logger.error(f"Error uploading base64 image: {e}")
            return {
                "error": str(e),
                "success": False
            }
```

---

### ✅ Phase 2 Completion Checklist

- [ ] Pydantic models created (`schemas.py`)
- [ ] Base AI agent class created (`base_agent.py`)
- [ ] Agent registry created (`registry.py`)
- [ ] 10 specialist agent files created
- [ ] OCR service implemented
- [ ] Image analysis service implemented
- [ ] File service implemented
- [ ] All services tested individually

**Phase 2 Complete!** ✅

---

**Continue to Part 3** for Phase 3 (Workflow 2: Chat-Integrated Analysis) implementation.
