# ============================================
# AI Doctor Platform - Backend Setup Script
# ============================================
# Run this script to set up the backend environment
# ============================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🏥 AI Doctor Platform - Backend Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check Python installation
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Create virtual environment
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "✓ Virtual environment already exists" -ForegroundColor Green
} else {
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

Write-Host ""

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet

Write-Host ""

# Install dependencies
Write-Host "Installing dependencies from requirements.txt..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
Write-Host "✓ Dependencies installed" -ForegroundColor Green

Write-Host ""

# Check .env file
Write-Host "Checking .env configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Update .env with your API keys:" -ForegroundColor Yellow
    Write-Host "  - GEMINI_API_KEY" -ForegroundColor White
    Write-Host "  - SUPABASE_URL" -ForegroundColor White
    Write-Host "  - SUPABASE_KEY" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env from template..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item .env.example .env
        Write-Host "✓ .env created. Please update with your API keys." -ForegroundColor Green
    } else {
        Write-Host "✗ .env.example not found!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✓ Backend Setup Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update .env with your API keys" -ForegroundColor White
Write-Host "2. Run Supabase migration (supabase/migrations/001_create_medical_tables.sql)" -ForegroundColor White
Write-Host "3. Create Supabase storage buckets: medical-images, medical-reports, generated-reports" -ForegroundColor White
Write-Host "4. Start the server: python app/main.py" -ForegroundColor White
Write-Host ""
Write-Host "Documentation: docs/IMPLEMENTATION_INDEX.md" -ForegroundColor Cyan
Write-Host ""
