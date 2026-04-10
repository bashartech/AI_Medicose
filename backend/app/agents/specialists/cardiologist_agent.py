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
