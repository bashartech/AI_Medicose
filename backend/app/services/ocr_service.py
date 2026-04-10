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
import os
import subprocess
from app.services.report_parser import MedicalReportParser
from app.services.report_text_cleaner import ReportTextCleaner

logger = logging.getLogger(__name__)

# Configure Tesseract path for Windows
# Common installation paths
TESSERACT_PATHS = [
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    os.path.expanduser(r'~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'),
    r'D:\Tesseract-OCR\tesseract.exe',
    r'C:\Users\H P\AppData\Local\Programs\Tesseract-OCR\tesseract.exe',
]

# Check for custom Tesseract path in environment variable
tesseract_found = False
custom_tesseract_path = os.getenv("TESSERACT_PATH")
if custom_tesseract_path and os.path.exists(custom_tesseract_path):
    pytesseract.pytesseract.tesseract_cmd = custom_tesseract_path
    logger.info(f"✅ Tesseract found via TESSERACT_PATH env var: {custom_tesseract_path}")
    tesseract_found = True
else:
    # Try to find Tesseract in common paths
    for path in TESSERACT_PATHS:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            logger.info(f"✅ Tesseract found at: {path}")
            tesseract_found = True
            break

    # If not found in common paths, try to find it in PATH
    if not tesseract_found:
        try:
            result = subprocess.run(['tesseract', '--version'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                logger.info("✅ Tesseract found in system PATH")
                tesseract_found = True
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError):
            pass

    if not tesseract_found:
        logger.warning("⚠️ Tesseract not found. OCR will use fallback mode.")
        logger.warning("💡 Install Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki")
        logger.warning("💡 Or set TESSERACT_PATH environment variable to your tesseract.exe path")


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
            # Return mock text if Tesseract is not installed
            return "[OCR] Tesseract not installed. Text extraction skipped. This is a development mode fallback."
    
    @staticmethod
    async def process_medical_report(file_bytes: bytes, file_type: str) -> Dict[str, Any]:
        """
        Process medical report and extract structured data.
        Uses AI-powered cleaning for professional results.
        """
        try:
            # Extract text based on file type
            if 'pdf' in file_type:
                ocr_text = await OCRService.extract_text_from_pdf(file_bytes)
            elif 'image' in file_type:
                ocr_text = await OCRService.extract_text_from_image(file_bytes)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
            # Use AI-powered cleaner first (fixes spelling mistakes)
            ai_result = ReportTextCleaner.parse_report_with_ai(ocr_text)
            
            if ai_result.get("success") and ai_result.get("data", {}).get("sections"):
                # AI parsing succeeded, use its results
                structured_data = ai_result["data"]
            else:
                # Fallback to regex parser
                structured_data = MedicalReportParser.parse_report(ocr_text)
            
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
        
        Handles structured medical reports with columns:
        Test Name | Result | Reference Range | Unit
        """
        structured = {
            "tests": [],
            "abnormal_values": [],
            "normal_ranges": [],
            "report_header": {},
            "sections": {}
        }
        
        # Extract patient info
        name_match = re.search(r'Name\s*[:\.]\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
        if name_match:
            structured["report_header"]["patient_name"] = name_match.group(1).strip()
        
        age_match = re.search(r'Age/Gender\s*[:\.]\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
        if age_match:
            structured["report_header"]["age_gender"] = age_match.group(1).strip()
        
        date_match = re.search(r'(?:Report|Collection)\s*Date\s*[:\.]\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
        if date_match:
            structured["report_header"]["date"] = date_match.group(1).strip()
        
        # Known lab test patterns
        known_tests = [
            "hemoglobin", "haemoglobin", "hgb", "total leucocyte", "tlc", "wbc",
            "differential", "neutrophil", "lymphocyte", "eosinophil", "monocyte", "basophil",
            "absolute", "rbc", "red blood cell", "platelet", "plt",
            "mcv", "mch", "mchc", "het", "rdw",
            "pct", "mpv", "pdw",
            "glucose", "sugar", "blood sugar", "hba1c",
            "cholesterol", "hdl", "ldl", "triglyceride",
            "creatinine", "urea", "bun", "uric acid",
            "albumin", "protein", "bilirubin",
            "alt", "ast", "alp", "sgot", "sgpt",
            "tsh", "t3", "t4", "thyroid",
            "sodium", "potassium", "chloride",
            "calcium", "iron", "vitamin",
            "pus cell", "epithelial", "bacteria",
            "specific gravity", "ph", "ketone",
            "nitrite", "leukocyte", "blood",
            "colour", "color", "transparency", "appearance"
        ]
        
        # Parse lines that look like: Test Name VALUE RANGE UNIT
        # Example: "Haemoglobin 15 13-17 g/dL"
        lines = text.split('\n')
        current_section = "General"
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect section headers
            if line.isupper() and len(line) > 3 and not any(c.isdigit() for c in line):
                current_section = line
                if current_section not in structured["sections"]:
                    structured["sections"][current_section] = []
                continue
            
            # Try to parse lab value patterns
            # Pattern: Test Name NUMBER NUMBER-NUMBER UNIT
            match = re.match(
                r'([A-Za-z\s]+?)\s+([\d.,]+)\s+([\d.,]+[\s\-–—]+[\d.,]+)\s+([A-Za-z/%μLmgdL]+)',
                line
            )
            
            if match:
                test_name = match.group(1).strip()
                value = match.group(2).strip()
                ref_range = match.group(3).strip()
                unit = match.group(4).strip()
                
                # Check if this is a known lab test
                if any(keyword in test_name.lower() for keyword in known_tests):
                    # Determine if value is in range
                    status = "normal"
                    try:
                        val_num = float(value.replace(',', ''))
                        range_parts = re.split(r'[\s\-–—]+', ref_range)
                        if len(range_parts) >= 2:
                            low = float(range_parts[0].replace(',', ''))
                            high = float(range_parts[1].replace(',', ''))
                            if val_num < low:
                                status = "low"
                            elif val_num > high:
                                status = "high"
                    except:
                        pass
                    
                    test_entry = {
                        "name": test_name.title(),
                        "value": value,
                        "ref_range": ref_range,
                        "unit": unit,
                        "status": status
                    }
                    
                    structured["tests"].append(test_entry)
                    if current_section in structured["sections"]:
                        structured["sections"][current_section].append(test_entry)
        
        # Remove duplicates
        seen = set()
        unique_tests = []
        for test in structured["tests"]:
            if test["name"] not in seen:
                seen.add(test["name"])
                unique_tests.append(test)
        structured["tests"] = unique_tests
        
        return structured
