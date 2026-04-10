"""
AI Triage System
=================
Classifies patient symptoms into emergency levels:
- 🚨 EMERGENCY: Immediate hospitalization required
- ⚠️ URGENT: Same-day medical attention needed
- ✅ NORMAL: Can wait for regular appointment
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# Emergency keyword patterns
EMERGENCY_PATTERNS = [
    "chest pain", "heart attack", "can't breathe", "difficulty breathing",
    "severe bleeding", "unconscious", "stroke", "paralysis",
    "severe allergic reaction", "anaphylaxis", "choking",
    "suicidal", "overdose", "severe burn", "major trauma",
    "coughing blood", "vomiting blood", "seizure",
    "sudden vision loss", "sudden severe headache",
    "high fever with rash", "stiff neck with fever"
]

URGENT_PATTERNS = [
    "fever", "abdominal pain", "persistent vomiting",
    "moderate bleeding", "fracture", "sprain",
    "urinary infection", "ear pain", "sore throat with fever",
    "mild allergic reaction", "rash with fever",
    "persistent diarrhea", "dehydration",
    "moderate headache", "back pain", "joint pain"
]

# Test recommendations by symptoms
TEST_RECOMMENDATIONS = {
    "chest pain": ["ECG/EKG", "Cardiac Enzyme Test (Troponin)", "Chest X-Ray", "Echocardiogram"],
    "heart": ["ECG/EKG", "Echocardiogram", "Lipid Profile", "Cardiac Stress Test"],
    "breathing": ["Chest X-Ray", "Pulmonary Function Test", "Oxygen Saturation", "CBC"],
    "fever": ["CBC", "Blood Culture", "Urinalysis", "Malaria Test", "Dengue Test"],
    "headache": ["CT Scan Head", "MRI Brain", "Blood Pressure Check", "Eye Exam"],
    "abdominal": ["Ultrasound Abdomen", "CBC", "Liver Function Test", "Kidney Function Test"],
    "diabetes": ["HbA1c", "Fasting Blood Sugar", "Oral Glucose Tolerance Test", "Lipid Profile"],
    "sugar": ["HbA1c", "Fasting Blood Sugar", "Postprandial Blood Sugar"],
    "thyroid": ["TSH", "Free T3", "Free T4", "Thyroid Antibodies"],
    "liver": ["Liver Function Test (LFT)", "Hepatitis Panel", "Ultrasound Abdomen", "Bilirubin"],
    "kidney": ["Kidney Function Test (KFT)", "Urinalysis", "Ultrasound KUB", "Creatinine"],
    "blood": ["CBC", "Blood Smear", "Iron Studies", "Vitamin B12", "Folate"],
    "anemia": ["CBC", "Iron Studies", "Ferritin", "Vitamin B12", "Folate"],
    "skin": ["Skin Biopsy", "Allergy Test", "Blood Sugar Test", "Thyroid Function"],
    "joint": ["X-Ray", "Rheumatoid Factor", "ESR", "CRP", "Uric Acid"],
    "bone": ["X-Ray", "Bone Density Scan (DEXA)", "Calcium Level", "Vitamin D"],
    "eye": ["Eye Exam", "Visual Field Test", "Intraocular Pressure", "Fundoscopy"],
    "vision": ["Eye Exam", "Visual Field Test", "Fundoscopy", "MRI Brain"],
    "urinary": ["Urinalysis", "Urine Culture", "Kidney Function Test", "Ultrasound KUB"],
    "pregnancy": ["Urine Pregnancy Test", "Blood hCG", "Ultrasound", "CBC"],
    "mental": ["Psychological Assessment", "Thyroid Function", "Vitamin D", "CBC"],
    "depression": ["Psychological Assessment", "Thyroid Function", "Vitamin B12", "Vitamin D"],
    "fatigue": ["CBC", "Thyroid Function", "Iron Studies", "Vitamin D", "Blood Sugar"],
    "weight": ["Thyroid Function", "Blood Sugar", "Lipid Profile", "Liver Function"],
    "dizziness": ["Blood Pressure Check", "CBC", "Blood Sugar", "ECG", "Inner Ear Exam"],
    "nausea": ["Pregnancy Test", "Liver Function", "Blood Sugar", "Electrolytes"],
    "vomiting": ["Electrolytes", "Kidney Function", "Liver Function", "Pregnancy Test"],
    "diarrhea": ["Stool Test", "Electrolytes", "CBC", "Blood Culture"],
    "cough": ["Chest X-Ray", "CBC", "Sputum Test", "Tuberculosis Test"],
    "cold": ["CBC", "Throat Swab", "Allergy Test"],
    "allergy": ["Allergy Panel", "IgE Test", "CBC", "Skin Prick Test"],
    "back pain": ["X-Ray Spine", "MRI Spine", "CBC", "ESR", "CRP"],
    "neck pain": ["X-Ray Cervical Spine", "MRI Cervical Spine", "ESR"],
    "seizure": ["EEG", "MRI Brain", "CT Scan Head", "Blood Sugar", "Electrolytes"],
    "fainting": ["ECG", "Blood Sugar", "CBC", "Echocardiogram", "Tilt Table Test"],
}


def classify_triage(symptoms: str, vital_signs: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Classify patient symptoms into emergency levels.
    """
    symptoms_lower = symptoms.lower()
    
    # Check for emergency patterns
    emergency_matches = [p for p in EMERGENCY_PATTERNS if p in symptoms_lower]
    urgent_matches = [p for p in URGENT_PATTERNS if p in symptoms_lower]
    
    # Check vital signs if provided
    vital_risk = []
    if vital_signs:
        if vital_signs.get("heart_rate", 0) > 120 or vital_signs.get("heart_rate", 0) < 50:
            vital_risk.append("Abnormal heart rate")
        if vital_signs.get("blood_pressure_systolic", 0) > 180 or vital_signs.get("blood_pressure_systolic", 0) < 90:
            vital_risk.append("Dangerous blood pressure")
        if vital_signs.get("temperature", 0) > 103 or vital_signs.get("temperature", 0) < 95:
            vital_risk.append("Abnormal temperature")
        if vital_signs.get("oxygen_saturation", 100) < 92:
            vital_risk.append("Low oxygen saturation")
    
    # Determine triage level
    if len(emergency_matches) > 0 or len(vital_risk) > 0:
        triage_level = "EMERGENCY"
        urgency = "🚨"
        action = "Seek emergency medical care immediately. Go to the nearest hospital or call emergency services."
        risk_score = 90
    elif len(urgent_matches) > 0:
        triage_level = "URGENT"
        urgency = "⚠️"
        action = "Seek medical attention today. Visit an urgent care clinic or contact your doctor."
        risk_score = 60
    else:
        triage_level = "NORMAL"
        urgency = "✅"
        action = "Schedule a regular appointment with your healthcare provider."
        risk_score = 30
    
    # Recommend tests based on symptoms
    recommended_tests = []
    for keyword, tests in TEST_RECOMMENDATIONS.items():
        if keyword in symptoms_lower:
            recommended_tests.extend(tests)
    
    # Remove duplicates
    recommended_tests = list(dict.fromkeys(recommended_tests))
    
    return {
        "triage_level": triage_level,
        "urgency": urgency,
        "risk_score": risk_score,
        "action": action,
        "emergency_indicators": emergency_matches,
        "urgent_indicators": urgent_matches,
        "vital_risks": vital_risk,
        "recommended_tests": recommended_tests[:5]  # Top 5 tests
    }
