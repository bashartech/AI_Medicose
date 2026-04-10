"""
Report Text Cleaner & Normalizer
==================================
Uses AI to clean OCR text from medical reports:
- Fixes spelling mistakes (ILIRUBN → BILIRUBIN)
- Extracts structured test results
- Provides patient-friendly explanations
"""

import re
import logging
from typing import Dict, Any, List, Optional
import google.generativeai as genai
import os
import json

logger = logging.getLogger(__name__)


class ReportTextCleaner:
    """
    Cleans and normalizes OCR text from medical reports.
    Fixes spelling mistakes and extracts structured data.
    """
    
    # Common medical test name corrections
    TEST_NAME_CORRECTIONS = {
        "ILIRUBN": "BILIRUBIN",
        "BILIRUBN": "BILIRUBIN",
        "NATE": "URATE",
        "URETE": "URATE",
        "CREATININE": "CREATININE",
        "CREATININ": "CREATININE",
        "HAEMOGLOBIN": "HAEMOGLOBIN",
        "HEMOGLOBIN": "HEMOGLOBIN",
        "LEUCOCYTE": "LEUCOCYTE",
        "LEUKOCYTE": "LEUKOCYTE",
        "NEUTROPHILS": "NEUTROPHILS",
        "LYMPHOCYTES": "LYMPHOCYTES",
        "EOSINOPHILS": "EOSINOPHILS",
        "MONOCYTES": "MONOCYTES",
        "BASOPHILS": "BASOPHILS",
        "THROMBOCYTES": "THROMBOCYTES",
        "PLATELETS": "PLATELETS",
        "SPECIFIC GRAVITY": "SPECIFIC GRAVITY",
        "EPITHILIAL": "EPITHELIAL",
        "EPITHELIAL": "EPITHELIAL",
        "KETONE BODIES": "KETONE BODIES",
        "SUGAR / GLUCOSE": "SUGAR / GLUCOSE",
        "PROTEIN ALBUMIN": "PROTEIN / ALBUMIN",
        "PUS CELLS": "PUS CELLS",
        "RED BLOOD CELLS": "RED BLOOD CELLS",
        "WHITE BLOOD CELLS": "WHITE BLOOD CELLS",
        "RBC": "RBC",
        "WBC": "WBC",
        "HB": "HB",
        "HCT": "HCT",
        "MCV": "MCV",
        "MCH": "MCH",
        "MCHC": "MCHC",
        "RDW": "RDW",
        "MPV": "MPV",
        "PDW": "PDW",
        "PCT": "PCT",
        "SGOT": "SGOT",
        "SGPT": "SGPT",
        "ALT": "ALT",
        "AST": "AST",
        "ALP": "ALP",
        "TSH": "TSH",
        "T3": "T3",
        "T4": "T4",
        "HBA1C": "HBA1C",
        "LDL": "LDL",
        "HDL": "HDL",
        "VLDL": "VLDL",
    }
    
    @staticmethod
    def clean_test_name(name: str) -> str:
        """Fix common spelling mistakes in test names."""
        name_upper = name.upper().strip()
        
        # Direct corrections
        if name_upper in ReportTextCleaner.TEST_NAME_CORRECTIONS:
            return ReportTextCleaner.TEST_NAME_CORRECTIONS[name_upper]
        
        # Fuzzy matching for similar names
        for correct_name, correction in ReportTextCleaner.TEST_NAME_CORRECTIONS.items():
            # If the name is 80% similar to a known test name, use the correction
            if len(name_upper) > 3 and len(correct_name) > 3:
                common_chars = sum(1 for a, b in zip(name_upper, correct_name) if a == b)
                similarity = common_chars / max(len(name_upper), len(correct_name))
                if similarity > 0.7:
                    return correction
        
        # Title case the name if no correction found
        return name.title()
    
    @staticmethod
    def parse_report_with_ai(ocr_text: str) -> Dict[str, Any]:
        """
        Use AI to parse and clean OCR text from medical reports.
        Returns structured data with corrected test names and values.
        """
        try:
            gemini_api_key = os.getenv("GEMINI_API_KEY")
            if not gemini_api_key:
                return ReportTextCleaner._parse_with_regex(ocr_text)
            
            genai.configure(api_key=gemini_api_key)
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            prompt = f"""You are an expert medical report parser. Parse this OCR text from a medical lab report and extract structured data.

**Instructions:**
1. Fix all spelling mistakes in test names (e.g., "ILIRUBN" → "BILIRUBIN", "NATE" → "URATE")
2. Extract test name, value, reference range, and unit for each test
3. Determine if each value is Normal, High, or Low based on the reference range
4. Return ONLY valid JSON, no other text

**Output Format:**
```json
{{
  "patient_info": {{
    "name": "Patient Name",
    "age_gender": "Age/Gender"
  }},
  "sections": [
    {{
      "name": "SECTION NAME",
      "tests": [
        {{
          "name": "Test Name (corrected spelling)",
          "value": "value",
          "ref_range": "reference range",
          "unit": "unit",
          "status": "normal|high|low"
        }}
      ]
    }}
  ]
}}
```

**OCR Text to Parse:**
{ocr_text}

Return ONLY the JSON, no other text."""

            response = model.generate_content(prompt)
            
            # Extract JSON from response
            response_text = response.text.strip()
            logger.info(f"AI Response: {response_text[:500]}...")
            
            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                response_text = response_text.split("\n", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text.rsplit("\n", 1)[0]
            
            # Parse JSON
            parsed_data = json.loads(response_text.strip())
            logger.info(f"AI parsed {len(parsed_data.get('sections', []))} sections")
            
            return {
                "success": True,
                "data": parsed_data
            }
            
        except Exception as e:
            logger.error(f"AI parsing failed: {e}, falling back to regex")
            return ReportTextCleaner._parse_with_regex(ocr_text)
    
    @staticmethod
    def _parse_with_regex(ocr_text: str) -> Dict[str, Any]:
        """Fallback regex-based parser."""
        result = {
            "success": False,
            "data": {
                "patient_info": {},
                "sections": [],
                "all_tests": []
            }
        }
        
        lines = ocr_text.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect section headers
            if line.isupper() and len(line) > 3:
                current_section = {
                    "name": line,
                    "tests": []
                }
                result["data"]["sections"].append(current_section)
                continue
            
            # Try to parse test results
            # Pattern: Test Name VALUE REF_RANGE UNIT
            match = re.match(
                r'([A-Za-z\s]+?)\s+([\d.,]+)\s+([\d.,]+[\s\-–—]+[\d.,]+)\s+([A-Za-z/%μLmgdL]+)',
                line
            )
            
            if match:
                test_name = ReportTextCleaner.clean_test_name(match.group(1))
                value = match.group(2)
                ref_range = match.group(3)
                unit = match.group(4)
                
                test_entry = {
                    "name": test_name,
                    "value": value,
                    "ref_range": ref_range,
                    "unit": unit,
                    "status": "normal"  # Simplified
                }
                
                if current_section:
                    current_section["tests"].append(test_entry)
                result["data"]["all_tests"].append(test_entry)
        
        return result
