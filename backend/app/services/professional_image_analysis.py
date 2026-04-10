"""
Professional Image Analysis Service
====================================
Uses Gemini Vision API for REAL image analysis.
No more mock data - actual AI vision analysis.
"""

import io
import logging
from typing import Dict, Any, Optional
from PIL import Image
import base64
import google.generativeai as genai
import os

logger = logging.getLogger(__name__)


class ProfessionalImageAnalysisService:
    """
    Professional service for analyzing medical images using Gemini Vision.
    
    Supports:
    - X-ray analysis (actual image understanding)
    - MRI/CT scan analysis
    - Skin lesion analysis
    - Oral/dental analysis
    - Posture analysis
    """
    
    def __init__(self):
        """Initialize Gemini Vision model"""
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY not configured")
        
        genai.configure(api_key=gemini_api_key)
        # Use Gemini Pro Vision for image analysis
        self.vision_model = genai.GenerativeModel('gemini-2.5-flash')
    
    async def analyze_medical_image(
        self, 
        image_bytes: bytes, 
        image_type: str = "unknown",
        specialist_type: str = "general-physician"
    ) -> Dict[str, Any]:
        """
        Analyze medical image using Gemini Vision API.
        
        Args:
            image_bytes: Raw image bytes
            image_type: Type of image (xray, mri, skin, oral, posture)
            specialist_type: Which specialist is analyzing
        
        Returns:
            Dictionary with professional analysis results
        """
        try:
            # Convert image to PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Build specialist-specific prompt
            prompt = self._build_specialist_prompt(image_type, specialist_type)
            
            # Analyze image with Gemini Vision
            response = await self.vision_model.generate_content_async(
                [prompt, image],
                generation_config={
                    "temperature": 0.2,
                    "max_output_tokens": 2048,
                }
            )
            
            # Parse the response into structured data
            analysis_text = response.text
            
            # Return structured analysis
            return {
                "analysis_text": analysis_text,
                "image_type": image_type,
                "specialist_type": specialist_type,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error analyzing medical image: {e}")
            return {
                "error": str(e),
                "success": False
            }
    
    def _build_specialist_prompt(self, image_type: str, specialist_type: str) -> str:
        """
        Build specialist-specific prompt for Gemini Vision.
        
        Each specialist asks for different information from the image.
        """
        
        prompts = {
            "xray": """You are an expert radiologist analyzing this X-ray image.

Please provide a detailed professional analysis in this EXACT format:

## **X-Ray Analysis Report**

### **1. Problem Identified**
[Name the specific condition/problem visible in the X-ray]

### **2. Image Analysis**
- **Image Type**: [What type of X-ray is this?]
- **Anatomical Region**: [Which body part is shown?]
- **Key Findings**: [List specific observations]
- **Severity**: [Mild/Moderate/Severe]

### **3. Possible Causes**
- [List 2-3 possible causes]

### **4. Recovery & Treatment Options**
- **Immediate Care**: [What to do right now]
- **Medical Treatment**: [When to see a doctor]
- **Recovery Time**: [Expected healing timeline]

### **5. Recommended Medications**
- **Over-the-Counter**: [Suggest OTC pain relief if applicable]
- **Prescription**: [Mention when prescription meds are needed]
- **Note**: Always consult a doctor before using any medication

### **6. Important Disclaimer**
This analysis is AI-generated and for informational purposes only. Always consult a qualified radiologist or physician for proper diagnosis and treatment.""",

            "mri": """You are an expert radiologist analyzing this MRI scan.

Please provide a detailed professional analysis in this EXACT format:

## **MRI Analysis Report**

### **1. Problem Identified**
[Name the specific condition/problem visible in the MRI]

### **2. Image Analysis**
- **Scan Type**: [What type of MRI is this?]
- **Anatomical Region**: [Which body part is shown?]
- **Key Findings**: [List specific observations]
- **Severity**: [Mild/Moderate/Severe]

### **3. Possible Causes**
- [List 2-3 possible causes]

### **4. Recovery & Treatment Options**
- **Immediate Care**: [What to do right now]
- **Medical Treatment**: [When to see a specialist]
- **Recovery Time**: [Expected healing timeline]

### **5. Recommended Medications**
- **Over-the-Counter**: [Suggest OTC options if applicable]
- **Prescription**: [Mention when prescription meds are needed]
- **Note**: Always consult a doctor before using any medication

### **6. Important Disclaimer**
This analysis is AI-generated and for informational purposes only. Always consult a qualified radiologist or physician for proper diagnosis and treatment.""",

            "ct_scan": """You are an expert radiologist analyzing this CT scan.

Please provide a detailed professional analysis in this EXACT format:

## **CT Scan Analysis Report**

### **1. Problem Identified**
[Name the specific condition/problem visible in the CT scan]

### **2. Image Analysis**
- **Scan Type**: [What type of CT scan is this?]
- **Anatomical Region**: [Which body part is shown?]
- **Key Findings**: [List specific observations]
- **Severity**: [Mild/Moderate/Severe]

### **3. Possible Causes**
- [List 2-3 possible causes]

### **4. Recovery & Treatment Options**
- **Immediate Care**: [What to do right now]
- **Medical Treatment**: [When to see a doctor]
- **Recovery Time**: [Expected healing timeline]

### **5. Recommended Medications**
- **Over-the-Counter**: [Suggest OTC options if applicable]
- **Prescription**: [Mention when prescription meds are needed]
- **Note**: Always consult a doctor before using any medication

### **6. Important Disclaimer**
This analysis is AI-generated and for informational purposes only. Always consult a qualified radiologist or physician for proper diagnosis and treatment.""",

            "skin": """You are an expert dermatologist analyzing this skin image.

Please provide a detailed professional analysis in this EXACT format:

## **Skin Condition Analysis Report**

### **1. Problem Identified**
[Name the specific skin condition/problem visible in the image]

### **2. Image Analysis**
- **Location**: [Where on the body is this?]
- **Appearance**: [Describe color, size, border, texture]
- **Characteristics**: [List key features observed]
- **Severity**: [Mild/Moderate/Severe]

### **3. Possible Causes**
- [List 2-3 possible causes]

### **4. Recovery & Treatment Options**
- **Immediate Care**: [What to do right now]
- **Medical Treatment**: [When to see a dermatologist]
- **Recovery Time**: [Expected healing timeline]

### **5. Recommended Medications**
- **Over-the-Counter**: [Suggest OTC creams/ointments if applicable]
- **Prescription**: [Mention when prescription meds are needed]
- **Note**: Always consult a dermatologist before using any medication

### **6. Home Care & Prevention**
- **Skincare Routine**: [Specific care instructions]
- **Lifestyle Changes**: [Diet, sun protection, etc.]
- **When to Seek Emergency Care**: [Red flag symptoms]

### **7. Important Disclaimer**
This analysis is AI-generated and for informational purposes only. Always consult a qualified dermatologist for proper diagnosis and treatment.""",

            "oral": """You are an expert dentist analyzing this oral/dental image.

Please provide a detailed professional analysis in this EXACT format:

## **Dental/Oral Health Analysis Report**

### **1. Problem Identified**
[Name the specific dental problem visible in the image]

### **2. Image Analysis**
- **What is shown**: [Teeth, gums, specific area]
- **Key Findings**: [List observations - cavities, gum health, etc.]
- **Severity**: [Mild/Moderate/Severe]

### **3. Possible Causes**
- [List 2-3 possible causes]

### **4. Recovery & Treatment Options**
- **Immediate Care**: [What to do right now for pain/discomfort]
- **Dental Treatment**: [What a dentist would do]
- **Recovery Time**: [Expected healing timeline]

### **5. Recommended Care**
- **Over-the-Counter**: [Pain relief options if applicable]
- **Oral Hygiene**: [Specific care instructions]
- **Note**: Always consult a dentist before using any medication

### **6. Home Care & Prevention**
- **Daily Routine**: [Brushing, flossing, mouthwash]
- **Dietary Advice**: [Foods to avoid/eat for dental health]
- **When to Seek Emergency Care**: [Severe pain, swelling, bleeding]

### **7. Important Disclaimer**
This analysis is AI-generated and for informational purposes only. Always consult a qualified dentist for proper diagnosis and treatment.""",

            "eye": """You are an expert ophthalmologist analyzing this eye condition image.

Please provide a detailed professional analysis in this EXACT format:

## **Eye Condition Analysis Report**

### **1. Problem Identified**
[Name the specific eye condition/problem visible in the image]

### **2. Image Analysis**
- **What is shown**: [Describe what you see in the image]
- **Key Observations**: [List specific findings]
- **Severity**: [Mild/Moderate/Severe]

### **3. Possible Causes**
- [List 2-3 possible causes]

### **4. Recovery & Treatment Options**
- **Immediate Care**: [What to do right now]
- **Medical Treatment**: [When to see an eye specialist]
- **Recovery Time**: [Expected recovery timeline]

### **5. Recommended Care**
- **Over-the-Counter**: [Eye drops, lubricants if applicable]
- **Prescription**: [When prescription meds are needed]
- **Note**: Always consult an eye specialist before using any medication

### **6. Home Care & Eye Exercises**
- **Eye Exercises**: [Specific exercises if applicable]
- **Lifestyle Changes**: [Screen time, lighting, rest]
- **When to Seek Emergency Care**: [Sudden vision loss, severe pain]

### **7. Important Disclaimer**
This analysis is AI-generated and for informational purposes only. Always consult a qualified ophthalmologist for proper diagnosis and treatment.""",

            "posture": """You are an expert physiotherapist analyzing this posture image.

Please provide a detailed professional analysis in this EXACT format:

## **Posture & Spine Analysis Report**

### **1. Problem Identified**
[Name the specific posture issue visible in the image]

### **2. Posture Assessment**
- **Spinal Alignment**: [Is it normal or abnormal?]
- **Key Findings**: [List specific issues observed]
- **Severity**: [Mild/Moderate/Severe]
- **Body Regions Affected**: [Neck, upper back, lower back, etc.]

### **3. Possible Causes**
- [List 2-3 possible causes - sitting habits, injury, etc.]

### **4. Recovery & Treatment Options**
- **Immediate Relief**: [What to do right now for pain]
- **Physical Therapy**: [When to see a physiotherapist]
- **Recovery Time**: [Expected improvement timeline]

### **5. Recommended Exercises**
- **Stretching Exercises**: [List 3-4 specific stretches with instructions]
- **Strengthening Exercises**: [List 2-3 strengthening exercises]
- **Daily Routine**: [How often to do these exercises]

### **6. Lifestyle Corrections**
- **Ergonomics**: [Desk setup, chair, monitor height]
- **Sleeping Position**: [Best positions for spine health]
- **When to Seek Emergency Care**: [Red flag symptoms]

### **7. Important Disclaimer**
This analysis is AI-generated and for informational purposes only. Always consult a qualified physiotherapist for proper assessment and treatment.""",

            "unknown": """You are a medical professional analyzing this medical image.

Please provide a detailed professional analysis in this EXACT format:

## **Medical Image Analysis Report**

### **1. Problem Identified**
[Name the specific condition/problem visible in the image]

### **2. Image Analysis**
- **Image Type**: [What type of medical image is this?]
- **Anatomical Region**: [What body part is shown?]
- **Key Findings**: [List specific observations]
- **Severity**: [Mild/Moderate/Severe]

### **3. Possible Causes**
- [List 2-3 possible causes]

### **4. Recovery & Treatment Options**
- **Immediate Care**: [What to do right now]
- **Medical Treatment**: [When to see a doctor]
- **Recovery Time**: [Expected healing timeline]

### **5. Recommended Medications**
- **Over-the-Counter**: [Suggest OTC options if applicable]
- **Prescription**: [Mention when prescription meds are needed]
- **Note**: Always consult a doctor before using any medication

### **6. Important Disclaimer**
This analysis is AI-generated and for informational purposes only. Always consult a qualified healthcare provider for proper diagnosis and treatment."""
        }
        
        return prompts.get(image_type, prompts["unknown"])
