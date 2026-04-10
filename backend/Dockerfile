FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
# - tesseract-ocr: Required for pytesseract (OCR)
# - libgl1: Required for OpenCV (replaces libgl1-mesa-glx which is obsolete in newer Debian versions)
# - libglib2.0-0: Required for various system libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
# Hugging Face Spaces usually expects port 7860
EXPOSE 7860

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
