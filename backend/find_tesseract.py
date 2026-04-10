"""
Find Tesseract installation on Windows
Run this script to find where Tesseract is installed
"""

import os
import subprocess

print("=" * 50)
print("Searching for Tesseract OCR...")
print("=" * 50)

# Common paths to check
paths_to_check = [
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    r'D:\Tesseract-OCR\tesseract.exe',
    os.path.expanduser(r'~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'),
    r'C:\Users\H P\AppData\Local\Programs\Tesseract-OCR\tesseract.exe',
]

print("\nChecking common paths:")
for path in paths_to_check:
    exists = os.path.exists(path)
    status = "✅ Found" if exists else "❌ Not found"
    print(f"  {status}: {path}")
    
    if exists:
        print(f"\n💡 Add this to your backend/.env file:")
        print(f"  TESSERACT_PATH={path}")

# Check if in PATH
print("\nChecking system PATH:")
try:
    result = subprocess.run(['tesseract', '--version'], capture_output=True, text=True, timeout=5)
    if result.returncode == 0:
        print("  ✅ Tesseract found in PATH!")
        print(f"  Version: {result.stdout.split('\n')[0]}")
        print(f"\n💡 Tesseract is already in your PATH, no configuration needed!")
    else:
        print("  ❌ Tesseract not in PATH")
except FileNotFoundError:
    print("  ❌ Tesseract not found in PATH")
except Exception as e:
    print(f"  ❌ Error checking PATH: {e}")

print("\n" + "=" * 50)
print("If Tesseract is not found, install it from:")
print("https://github.com/UB-Mannheim/tesseract/wiki")
print("=" * 50)
