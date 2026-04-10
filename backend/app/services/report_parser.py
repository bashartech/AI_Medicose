"""
Medical Report Parser
======================
Parses OCR text from medical reports and extracts structured data.
Converts raw OCR text into patient-friendly structured format.
Handles: CBC, Urine, LFT, KFT, Thyroid, Lipid, Diabetes, etc.
"""

import re
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


class MedicalReportParser:
    """
    Parses medical report OCR text and extracts:
    - Patient information
    - Report metadata (date, lab name, etc.)
    - Lab test results organized by sections
    - Reference ranges and status indicators
    """
    
    # Known lab tests with their normal ranges
    KNOWN_TESTS = {
        # CBC Tests
        "hemoglobin": {"low": 12, "high": 17, "unit": "g/dL"},
        "haemoglobin": {"low": 12, "high": 17, "unit": "g/dL"},
        "hgb": {"low": 12, "high": 17, "unit": "g/dL"},
        "total leucocyte count": {"low": 4000, "high": 10000, "unit": "/μL"},
        "tlc": {"low": 4000, "high": 10000, "unit": "/μL"},
        "wbc": {"low": 4000, "high": 10000, "unit": "/μL"},
        "neutrophils": {"low": 40, "high": 80, "unit": "%"},
        "lymphocytes": {"low": 20, "high": 40, "unit": "%"},
        "eosinophils": {"low": 1, "high": 6, "unit": "%"},
        "monocytes": {"low": 2, "high": 10, "unit": "%"},
        "basophils": {"low": 0, "high": 1, "unit": "%"},
        "absolute neutrophils": {"low": 2000, "high": 7000, "unit": "/μL"},
        "absolute lymphocytes": {"low": 1000, "high": 3000, "unit": "/μL"},
        "absolute eosinophils": {"low": 20, "high": 500, "unit": "/μL"},
        "absolute monocytes": {"low": 200, "high": 1000, "unit": "/μL"},
        "rbc count": {"low": 4.5, "high": 5.5, "unit": "million/μL"},
        "mcv": {"low": 81, "high": 101, "unit": "fL"},
        "mch": {"low": 27, "high": 32, "unit": "pg"},
        "mchc": {"low": 31.5, "high": 34.5, "unit": "g/dL"},
        "hct": {"low": 40, "high": 50, "unit": "%"},
        "rdw": {"low": 11.6, "high": 14.0, "unit": "%"},
        "platelet count": {"low": 150000, "high": 410000, "unit": "/μL"},
        "mpv": {"low": 7.5, "high": 11.5, "unit": "fL"},
        "pdw": {"low": 9, "high": 17, "unit": "fL"},
        "pct": {"low": 0.1, "high": 0.5, "unit": "%"},
        
        # Urine Tests
        "colour": {"unit": ""},
        "color": {"unit": ""},
        "appearance": {"unit": ""},
        "transparency": {"unit": ""},
        "specific gravity": {"low": 1.005, "high": 1.030, "unit": ""},
        "ph": {"low": 4.5, "high": 8.0, "unit": ""},
        "protein": {"unit": ""},
        "albumin": {"unit": ""},
        "sugar": {"unit": ""},
        "glucose": {"low": 0, "high": 0, "unit": "mg/dL"},
        "ketone": {"unit": ""},
        "bilirubin": {"unit": ""},
        "urobilinogen": {"unit": ""},
        "nitrite": {"unit": ""},
        "leukocyte": {"unit": ""},
        "blood": {"unit": ""},
        "pus cells": {"low": 0, "high": 5, "unit": "/hpf"},
        "epithelial cells": {"low": 0, "high": 5, "unit": "/hpf"},
        "bacteria": {"unit": ""},
        "casts": {"unit": ""},
        "crystals": {"unit": ""},
        
        # Liver Function Tests (LFT)
        "bilirubin total": {"low": 0.1, "high": 1.2, "unit": "mg/dL"},
        "bilirubin direct": {"low": 0, "high": 0.3, "unit": "mg/dL"},
        "bilirubin indirect": {"low": 0.1, "high": 0.9, "unit": "mg/dL"},
        "sgot": {"low": 5, "high": 40, "unit": "U/L"},
        "ast": {"low": 5, "high": 40, "unit": "U/L"},
        "sgpt": {"low": 5, "high": 40, "unit": "U/L"},
        "alt": {"low": 5, "high": 40, "unit": "U/L"},
        "alp": {"low": 40, "high": 130, "unit": "U/L"},
        "total protein": {"low": 6.0, "high": 8.3, "unit": "g/dL"},
        "albumin": {"low": 3.5, "high": 5.5, "unit": "g/dL"},
        "globulin": {"low": 2.0, "high": 3.5, "unit": "g/dL"},
        "a/g ratio": {"low": 1.0, "high": 2.0, "unit": ""},
        
        # Kidney Function Tests (KFT)
        "urea": {"low": 15, "high": 40, "unit": "mg/dL"},
        "creatinine": {"low": 0.7, "high": 1.3, "unit": "mg/dL"},
        "uric acid": {"low": 3.5, "high": 7.2, "unit": "mg/dL"},
        "bun": {"low": 7, "high": 20, "unit": "mg/dL"},
        "sodium": {"low": 136, "high": 145, "unit": "mEq/L"},
        "potassium": {"low": 3.5, "high": 5.0, "unit": "mEq/L"},
        "chloride": {"low": 98, "high": 106, "unit": "mEq/L"},
        
        # Lipid Profile
        "cholesterol": {"low": 0, "high": 200, "unit": "mg/dL"},
        "triglycerides": {"low": 0, "high": 150, "unit": "mg/dL"},
        "hdl": {"low": 40, "high": 60, "unit": "mg/dL"},
        "ldl": {"low": 0, "high": 100, "unit": "mg/dL"},
        "vldl": {"low": 5, "high": 40, "unit": "mg/dL"},
        
        # Thyroid
        "tsh": {"low": 0.4, "high": 4.0, "unit": "mIU/L"},
        "t3": {"low": 80, "high": 200, "unit": "ng/dL"},
        "t4": {"low": 5.0, "high": 12.0, "unit": "μg/dL"},
        
        # Diabetes
        "hba1c": {"low": 4.0, "high": 5.6, "unit": "%"},
        "fasting glucose": {"low": 70, "high": 100, "unit": "mg/dL"},
        "post prandial": {"low": 70, "high": 140, "unit": "mg/dL"},
    }
    
    @staticmethod
    def parse_report(ocr_text: str) -> Dict[str, Any]:
        """
        Parse medical report OCR text into structured data.
        Handles CBC, Urine, LFT, KFT, Lipid, Thyroid, Diabetes reports.
        """
        result = {
            "lab_info": {},
            "patient_info": {},
            "report_metadata": {},
            "sections": [],
            "all_tests": []
        }
        
        lines = ocr_text.split('\n')
        current_section = None
        current_subsection = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Extract lab info
            if '@' in line and 'http' in line:
                result["lab_info"]["contact"] = line
            elif line.startswith('©') or line.startswith('&'):
                result["lab_info"]["name"] = line.replace('©', '').replace('&', '').strip()
            
            # Extract patient info
            name_match = re.search(r'Name\s*[:\.]\s*(.+?)(?:\s{2,}|$)', line, re.IGNORECASE)
            if name_match:
                result["patient_info"]["name"] = name_match.group(1).strip()
            
            age_match = re.search(r'Age/Gender\s*[:\.]\s*(.+?)(?:\s{2,}|$)', line, re.IGNORECASE)
            if age_match:
                result["patient_info"]["age_gender"] = age_match.group(1).strip()
            
            # Extract dates
            date_match = re.search(r'(?:Collection|Report)\s*Date\s*[:\.]\s*(.+?)(?:\s{2,}|$)', line, re.IGNORECASE)
            if date_match:
                result["report_metadata"]["date"] = date_match.group(1).strip()
            
            # Detect section headers (all caps, no numbers)
            if line.isupper() and len(line) > 3 and not any(c.isdigit() for c in line[:20]):
                # Create section for ANY all-caps header that looks like a medical section
                current_section = {
                    "name": line,
                    "tests": []
                }
                result["sections"].append(current_section)
                continue
            
            # Parse test results: Test Name VALUE RANGE UNIT
            # Pattern 1: "Haemoglobin 15 13-17 g/dL"
            test_match = re.match(
                r'([A-Za-z\s]+?)\s+([\d.,]+)\s+([\d.,]+[\s\-–—]+[\d.,]+)\s+([A-Za-z/%μLmgdL]+\.?)',
                line
            )
            pattern_type = 1 if test_match else None
            
            # Pattern 2: "Colour Yellow" or "pH 6.0" (qualitative results)
            if not test_match:
                test_match = re.match(
                    r'([A-Za-z\s]+?)\s+([A-Za-z][A-Za-z\s]+?)(?:\s+([A-Za-z/%μLmgdL]+\.?))?$',
                    line
                )
                if test_match:
                    pattern_type = 2
            
            # Pattern 3: "Pus Cells 2-3 /hpf" or "Bacteria Nil"
            if not test_match:
                test_match = re.match(
                    r'([A-Za-z\s]+?)\s+([\d.,\-–—]+)(?:\s+([A-Za-z/%μLmgdL]+\.?))?',
                    line
                )
                if test_match:
                    pattern_type = 3
            
            if test_match:
                test_name = test_match.group(1).strip()
                value = test_match.group(2).strip()
                
                # Extract ref_range and unit based on pattern type
                if pattern_type == 1:
                    # Pattern 1 has: name, value, ref_range, unit
                    ref_range = test_match.group(3).strip() if test_match.group(3) else ""
                    unit = test_match.group(4).strip().rstrip('.') if test_match.group(4) else ""
                elif pattern_type == 2:
                    # Pattern 2 has: name, value (qualitative), unit (optional)
                    ref_range = ""
                    unit = test_match.group(3).strip().rstrip('.') if test_match.group(3) else ""
                else:  # pattern_type == 3
                    # Pattern 3 has: name, value (range like 2-3), unit (optional)
                    ref_range = ""
                    unit = test_match.group(3).strip().rstrip('.') if test_match.group(3) else ""
                
                # Clean up test name
                test_name = re.sub(r'\s+', ' ', test_name).strip()
                
                # Determine status
                status = MedicalReportParser._determine_status(test_name, value, ref_range)
                
                test_entry = {
                    "name": test_name.title(),
                    "value": value,
                    "ref_range": ref_range,
                    "unit": unit,
                    "status": status,
                    "status_label": MedicalReportParser._get_status_label(status)
                }
                
                if current_section:
                    current_section["tests"].append(test_entry)
                result["all_tests"].append(test_entry)
        
        # If no sections were detected, put all tests in a "Test Results" section
        if not result["sections"] and result["all_tests"]:
            result["sections"].append({
                "name": "Test Results",
                "tests": result["all_tests"]
            })
        
        return result
    
    @staticmethod
    def _determine_status(test_name: str, value: str, ref_range: str) -> str:
        """Determine if test value is normal, high, or low."""
        # Check if value is qualitative (not a number)
        try:
            val_num = float(value.replace(',', ''))
        except:
            return "normal"  # Qualitative results are assumed normal
        
        # Check against reference range if available
        if ref_range:
            try:
                range_parts = re.split(r'[\s\-–—]+', ref_range)
                if len(range_parts) >= 2:
                    low = float(range_parts[0].replace(',', ''))
                    high = float(range_parts[1].replace(',', ''))
                    
                    if val_num < low:
                        return "low"
                    elif val_num > high:
                        return "high"
            except:
                pass
        
        # Check against known test ranges
        test_key = test_name.lower().strip()
        if test_key in MedicalReportParser.KNOWN_TESTS:
            known = MedicalReportParser.KNOWN_TESTS[test_key]
            if "low" in known and "high" in known:
                if val_num < known["low"]:
                    return "low"
                elif val_num > known["high"]:
                    return "high"
        
        return "normal"
    
    @staticmethod
    def _get_status_label(status: str) -> str:
        """Get human-readable status label."""
        labels = {
            "normal": "Normal",
            "high": "Above Normal",
            "low": "Below Normal"
        }
        return labels.get(status, "Normal")
