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
    "high fever with rash", "stiff neck with fever",
    # Heart-related emergency patterns (expanded)
    "pain in heart", "heart pain", "severe chest", "chest tightness",
    "crushing chest", "radiating pain", "pain radiating",
    "shortness of breath", "can't catch breath", "gasping",
    "heart feels", "heavy chest", "pressure in chest",
    "severe heart", "heart hurting", "heart stabbing",
    # Severe pain patterns
    "severe pain", "worst pain", "unbearable pain", "excruciating",
    "agony", "intense pain", "extreme pain",
    # Breathing emergencies
    "struggling to breathe", "hard to breathe", "cannot breathe",
    "wheezing severely", "lips turning blue",
    # Neurological emergencies
    "confusion", "slurred speech", "face drooping", "arm weakness",
    "sudden numbness", "loss of consciousness",
    # Other emergencies
    "passing out", "fainting", "coughing up blood",
    "black stool", "bloody stool", "severe abdominal",
    "rigid abdomen", "board-like abdomen"
]

URGENT_PATTERNS = [
    "fever", "abdominal pain", "persistent vomiting",
    "moderate bleeding", "fracture", "sprain",
    "urinary infection", "ear pain", "sore throat with fever",
    "mild allergic reaction", "rash with fever",
    "persistent diarrhea", "dehydration",
    "moderate headache", "back pain", "joint pain",
    # Heart-related urgent patterns
    "mild chest", "palpitations", "rapid heartbeat",
    "irregular heartbeat", "fluttering", "heart skipping",
    "dizzy", "lightheaded", "swelling in legs",
    "short of breath", "breathing difficulty",
    # Other urgent patterns
    "burning urination", "blood in urine", "painful urination",
    "high fever", "stiff neck", "ear discharge",
    "moderate pain", "constant pain", "worsening pain",
    "nausea", "vomiting", "loss of appetite",
    "yellow skin", "yellow eyes", "dark urine",
    "swollen", "inflammation", "redness",
    "rash", "hives", "itching"
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
    Uses pattern matching with severity modifiers for accurate triage.
    """
    symptoms_lower = symptoms.lower()

    # Severity modifiers that escalate urgency
    SEVERE_MODIFIERS = ["severe", "extreme", "intense", "worst", "unbearable", "excruciating", "sudden", "sharp", "crushing", "heavy", "tight"]
    HAS_SEVERE = any(mod in symptoms_lower for mod in SEVERE_MODIFIERS)

    # Check for emergency patterns
    emergency_matches = [p for p in EMERGENCY_PATTERNS if p in symptoms_lower]
    urgent_matches = [p for p in URGENT_PATTERNS if p in symptoms_lower]

    # Escalate to emergency if urgent symptoms + severe modifier
    if HAS_SEVERE and len(urgent_matches) > 0 and len(emergency_matches) == 0:
        # Check if symptoms relate to critical organs (heart, brain, breathing)
        critical_keywords = ["heart", "chest", "breath", "head", "brain", "stroke", "numb", "weakness"]
        has_critical = any(kw in symptoms_lower for kw in critical_keywords)
        if has_critical:
            emergency_matches.extend(urgent_matches)
            urgent_matches = []

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

    # Determine triage level with nuanced scoring
    if len(emergency_matches) > 0 or len(vital_risk) > 0:
        triage_level = "EMERGENCY"
        urgency = "🚨"
        action = "Seek emergency medical care immediately. Go to the nearest hospital or call emergency services."
        risk_score = 85 if len(emergency_matches) == 1 else min(95, 80 + len(emergency_matches) * 5)
    elif len(urgent_matches) > 0:
        triage_level = "URGENT"
        urgency = "⚠️"
        action = "Seek medical attention today. Visit an urgent care clinic or contact your doctor."
        risk_score = 55 if HAS_SEVERE else 50
        if len(urgent_matches) > 1:
            risk_score = min(70, risk_score + len(urgent_matches) * 5)
    else:
        triage_level = "NORMAL"
        urgency = "✅"
        action = "Schedule a regular appointment with your healthcare provider."
        risk_score = 25 if HAS_SEVERE else 15

    # Recommend tests based on symptoms
    recommended_tests = []
    for keyword, tests in TEST_RECOMMENDATIONS.items():
        if keyword in symptoms_lower:
            recommended_tests.extend(tests)

    # Remove duplicates while preserving order
    recommended_tests = list(dict.fromkeys(recommended_tests))

    return {
        "triage_level": triage_level,
        "urgency": urgency,
        "risk_score": risk_score,
        "action": action,
        "emergency_indicators": emergency_matches,
        "urgent_indicators": urgent_matches,
        "vital_risks": vital_risk,
        "severity_detected": HAS_SEVERE,
        "recommended_tests": recommended_tests[:5]  # Top 5 tests
    }
