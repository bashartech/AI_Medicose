# 🏥 AI Doctor Platform - Complete Implementation Plan

## Step-by-Step Guide from Start to End with Both Workflows

This document contains **every single step** needed to implement the complete AI Doctor Platform with **both workflows** (Dedicated Upload and Chat-Integrated), ensuring no feature from detail.md is missed.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Phase 1: Backend Setup & Infrastructure (Days 1-2)](#2-phase-1-backend-setup--infrastructure)
3. [Phase 2: Backend Core Services (Days 3-5)](#3-phase-2-backend-core-services)
4. [Phase 3: Workflow 2 - Chat-Integrated Analysis (Days 6-9)](#4-phase-3-workflow-2-chat-integrated-analysis)
5. [Phase 4: Workflow 1 - Dedicated Upload Pages (Days 10-14)](#5-phase-4-workflow-1-dedicated-upload-pages)
6. [Phase 5: Multi-Modal Analysis (Day 15)](#6-phase-5-multi-modal-analysis)
7. [Phase 6: History & Dashboard (Days 16-17)](#7-phase-6-history--dashboard)
8. [Phase 7: Testing & Polish (Days 18-19)](#8-phase-7-testing--polish)
9. [Phase 8: Deployment (Day 20)](#9-phase-8-deployment)
10. [Phase 9: Advanced Features (Days 21-26)](#10-phase-9-advanced-features)

---

## 1. Project Overview

### Goal
Build a fully web-based AI Doctor platform where patients can:
- Upload medical reports (blood, urine, lab reports) - **PDF/images**
- Upload or capture images (X-rays, skin, oral, posture) - **via upload or webcam**
- Receive expert AI-generated explanations, advice, and recommendations
- Interact with **10 specialty doctor agents** powered by Gemini API
- Keep history of reports, images, and AI analysis

### Two Workflows

#### Workflow 1: Dedicated Upload & Analysis
```
User visits /upload-image → Selects specialist → Uploads file → 
ML/OCR analysis → Results displayed → Download PDF / Save to history
```

#### Workflow 2: Chat-Integrated Analysis
```
User opens chat → Uploads file in conversation → 
AI analyzes in context → Natural response → Follow-up questions
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + Vite + TypeScript + Tailwind CSS + ShadCN UI | UI, file uploads, webcam, results display |
| Backend | Python + FastAPI | File processing (OCR, image analysis), API endpoints |
| AI | Gemini API (Google) | 10 specialist doctor agents |
| ML Models | HuggingFace Transformers + MediaPipe | X-ray, skin, oral, posture analysis |
| OCR | PyTesseract + pdfplumber | Extract text from PDFs and images |
| Database | Supabase (PostgreSQL) | Store users, files, analyses, history |
| Storage | Supabase Storage | Store uploaded files securely |
| Deployment | Vercel (frontend) + Render (backend) | Production hosting |

---

## 2. Phase 1: Backend Setup & Infrastructure

**Duration:** Days 1-2  
**Goal:** Set up Python FastAPI backend with all infrastructure

---

### Step 1.1: Create Backend Directory Structure

**Action:** Create complete folder structure for backend

```bash
# In project root (D:\DATA\btmedai-main)
mkdir backend
cd backend

# Create main application directories
mkdir -p app/agents/specialists
mkdir -p app/services
mkdir -p app/routes
mkdir -p app/models
mkdir -p app/utils
mkdir -p app/storage

# Create __init__.py files for Python packages
touch app/__init__.py
touch app/agents/__init__.py
touch app/agents/specialists/__init__.py
touch app/services/__init__.py
touch app/routes/__init__.py
touch app/models/__init__.py
touch app/utils/__init__.py
touch app/storage/__init__.py
```

**Windows (PowerShell):**
```powershell
cd D:\DATA\btmedai-main
New-Item -ItemType Directory -Path backend\app\agents\specialists -Force
New-Item -ItemType Directory -Path backend\app\services -Force
New-Item -ItemType Directory -Path backend\app\routes -Force
New-Item -ItemType Directory -Path backend\app\models -Force
New-Item -ItemType Directory -Path backend\app\utils -Force
New-Item -ItemType Directory -Path backend\app\storage -Force

New-Item -ItemType File -Path backend\app\__init__.py -Force
New-Item -ItemType File -Path backend\app\agents\__init__.py -Force
New-Item -ItemType File -Path backend\app\agents\specialists\__init__.py -Force
New-Item -ItemType File -Path backend\app\services\__init__.py -Force
New-Item -ItemType File -Path backend\app\routes\__init__.py -Force
New-Item -ItemType File -Path backend\app\models\__init__.py -Force
New-Item -ItemType File -Path backend\app\utils\__init__.py -Force
```

**Result:**
```
backend/
├── app/
│   ├── __init__.py
│   ├── agents/
│   │   ├── __init__.py
│   │   └── specialists/
│   │       └── __init__.py
│   ├── services/
│   │   └── __init__.py
│   ├── routes/
│   │   └── __init__.py
│   ├── models/
│   │   └── __init__.py
│   ├── utils/
│   │   └── __init__.py
│   └── storage/
│       └── __init__.py
└── (to be continued)
```

---

### Step 1.2: Create Requirements File

**Action:** Create `backend/requirements.txt` with all dependencies

**File:** `backend/requirements.txt`

```txt
# ============================================
# Web Framework
# ============================================
fastapi==0.115.0
uvicorn[standard]==0.30.6
python-multipart==0.0.9

# ============================================
# Data Validation & Settings
# ============================================
pydantic==2.8.2
pydantic-settings==2.4.0

# ============================================
# Environment
# ============================================
python-dotenv==1.0.1

# ============================================
# Supabase (Database & Storage)
# ============================================
supabase==2.5.0

# ============================================
# AI/ML - Google Gemini
# ============================================
google-generativeai==0.7.0

# ============================================
# OCR - Text Extraction from PDFs/Images
# ============================================
pytesseract==0.3.13
pdfplumber==0.11.4

# ============================================
# Image Processing
# ============================================
Pillow==10.4.0
opencv-python==4.10.0
numpy==1.26.4

# ============================================
# Pose Estimation (for posture analysis)
# ============================================
mediapipe==0.10.15

# ============================================
# PDF Generation
# ============================================
reportlab==4.2.2

# ============================================
# File Handling (Async)
# ============================================
aiofiles==24.1.0

# ============================================
# HTTP Client
# ============================================
httpx==0.27.0

# ============================================
# Utilities
# ============================================
python-dateutil==2.9.0
```

---

### Step 1.3: Set Up Python Virtual Environment

**Action:** Create and activate Python virtual environment

**Commands:**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on Linux/Mac
# source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt

# Verify installations
pip list
```

**Expected Output:**
```
Package                  Version
------------------------ ---------
fastapi                  0.115.0
uvicorn                  0.30.6
pydantic                 2.8.2
supabase                 2.5.0
google-generativeai      0.7.0
pytesseract              0.3.13
pdfplumber               0.11.4
Pillow                   10.4.0
opencv-python            4.10.0
mediapipe                0.10.15
reportlab                4.2.2
... (and more)
```

---

### Step 1.4: Create Environment Configuration

**Action:** Create `backend/.env` with all API keys and configuration

**File:** `backend/.env`

```env
# ============================================
# API Keys
# ============================================
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here

# ============================================
# Supabase Configuration
# ============================================
SUPABASE_URL=https://gdndzkwtkxqjecntzxik.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbmR6a3d0a3hxamVjbnR6eGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjY1NjMsImV4cCI6MjA3OTU0MjU2M30.yCTczRpKO7CGdQWF7tjmRoibSpv2olqBFt6bJe4JHnI

# ============================================
# Application URLs
# ============================================
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# ============================================
# Environment Settings
# ============================================
ENVIRONMENT=development
DEBUG=True

# ============================================
# AI Model Settings
# ============================================
DEFAULT_GEMINI_MODEL=gemini-2.0-flash

# ============================================
# File Upload Settings
# ============================================
MAX_FILE_SIZE_MB=10
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp
ALLOWED_DOCUMENT_TYPES=pdf,png,jpg,jpeg

# ============================================
# Storage Settings
# ============================================
SUPABASE_STORAGE_BUCKET_IMAGES=medical-images
SUPABASE_STORAGE_BUCKET_REPORTS=medical-reports
SUPABASE_STORAGE_BUCKET_GENERATED=generated-reports

# ============================================
# Security
# ============================================
SECRET_KEY=your-secret-key-change-in-production
```

**Important:** Replace `your_gemini_api_key_here` with your actual Gemini API key.

---

### Step 1.5: Update Frontend Environment Variables

**Action:** Update root `.env` file with backend URL

**File:** `.env` (in project root)

```env
# ============================================
# Existing Supabase Configuration
# ============================================
VITE_SUPABASE_PROJECT_ID="gdndzkwtkxqjecntzxik"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbmR6a3d0a3hxamVjbnR6eGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjY1NjMsImV4cCI6MjA3OTU0MjU2M30.yCTczRpKO7CGdQWF7tjmRoibSpv2olqBFt6bJe4JHnI"
VITE_SUPABASE_URL="https://gdndzkwtkxqjecntzxik.supabase.co"

# ============================================
# NEW: Backend API URL
# ============================================
VITE_BACKEND_URL="http://localhost:8000/api/v1"

# ============================================
# File Upload Settings
# ============================================
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
```

---

### Step 1.6: Create Supabase Database Schema

**Action:** Create SQL migration file for all database tables

**File:** `supabase/migrations/001_create_medical_tables.sql`

```sql
-- ============================================
-- AI Doctor Platform - Complete Database Schema
-- ============================================
-- This migration creates all tables needed for both workflows:
-- - Workflow 1: Dedicated Upload & Analysis
-- - Workflow 2: Chat-Integrated Analysis
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- Extended user profiles linked to Supabase Auth
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. MEDICAL REPORTS TABLE (Workflow 1)
-- Stores uploaded lab reports (PDF/images)
-- ============================================
CREATE TABLE IF NOT EXISTS medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  ocr_text TEXT,
  structured_data JSONB,
  specialist_type TEXT NOT NULL,
  report_type TEXT CHECK (report_type IN ('blood', 'urine', 'xray', 'mri', 'ct_scan', 'ultrasound', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_reports_user_id ON medical_reports(user_id);
CREATE INDEX idx_reports_specialist ON medical_reports(specialist_type);
CREATE INDEX idx_reports_created_at ON medical_reports(created_at DESC);

-- Enable RLS
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON medical_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON medical_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON medical_reports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. MEDICAL IMAGES TABLE (Workflow 1)
-- Stores uploaded/captured medical images
-- ============================================
CREATE TABLE IF NOT EXISTS medical_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('xray', 'skin', 'oral', 'posture', 'retina', 'other')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  image_url TEXT,
  file_size BIGINT NOT NULL,
  ml_analysis_result JSONB,
  specialist_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_images_user_id ON medical_images(user_id);
CREATE INDEX idx_images_type ON medical_images(image_type);
CREATE INDEX idx_images_specialist ON medical_images(specialist_type);
CREATE INDEX idx_images_created_at ON medical_images(created_at DESC);

-- Enable RLS
ALTER TABLE medical_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own images"
  ON medical_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
  ON medical_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON medical_images FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. AI ANALYSES TABLE (Both Workflows)
-- Stores AI-generated analysis results
-- ============================================
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('dedicated', 'chat')),
  report_id UUID REFERENCES medical_reports(id) ON DELETE SET NULL,
  image_id UUID REFERENCES medical_images(id) ON DELETE SET NULL,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  specialist_type TEXT NOT NULL,
  analysis_text TEXT NOT NULL,
  diagnosis_summary TEXT,
  recommendations JSONB,
  confidence_score DECIMAL(5, 2),
  sources TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analyses_user_id ON ai_analyses(user_id);
CREATE INDEX idx_analyses_workflow ON ai_analyses(workflow_type);
CREATE INDEX idx_analyses_report_id ON ai_analyses(report_id);
CREATE INDEX idx_analyses_image_id ON ai_analyses(image_id);
CREATE INDEX idx_analyses_session_id ON ai_analyses(session_id);
CREATE INDEX idx_analyses_specialist ON ai_analyses(specialist_type);
CREATE INDEX idx_analyses_created_at ON ai_analyses(created_at DESC);

-- Enable RLS
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON ai_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert analyses"
  ON ai_analyses FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 5. SYMPTOMS TABLE
-- Stores user-reported symptoms
-- ============================================
CREATE TABLE IF NOT EXISTS symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  symptom_text TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  duration_days INTEGER,
  body_location TEXT,
  specialist_type TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_symptoms_user_id ON symptoms(user_id);
CREATE INDEX idx_symptoms_specialist ON symptoms(specialist_type);
CREATE INDEX idx_symptoms_created_at ON symptoms(created_at DESC);

-- Enable RLS
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptoms"
  ON symptoms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptoms"
  ON symptoms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptoms"
  ON symptoms FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. CONSULTATION HISTORY TABLE
-- Complete consultation records for both workflows
-- ============================================
CREATE TABLE IF NOT EXISTS consultation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('dedicated', 'chat')),
  specialist_type TEXT NOT NULL,
  symptoms TEXT,
  report_ids UUID[],
  image_ids UUID[],
  ai_analysis_id UUID REFERENCES ai_analyses(id) ON DELETE SET NULL,
  final_report TEXT,
  pdf_report_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_consultations_user_id ON consultation_history(user_id);
CREATE INDEX idx_consultations_workflow ON consultation_history(workflow_type);
CREATE INDEX idx_consultations_specialist ON consultation_history(specialist_type);
CREATE INDEX idx_consultations_created_at ON consultation_history(created_at DESC);

-- Enable RLS
ALTER TABLE consultation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations"
  ON consultation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert consultations"
  ON consultation_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own consultations"
  ON consultation_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. CHAT SESSIONS TABLE (Workflow 2)
-- Stores chat conversation history
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  specialist_type TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. CHAT MESSAGES TABLE (Workflow 2)
-- Individual messages in chat sessions
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM chat_sessions WHERE id = session_id
    )
  );

CREATE POLICY "System can insert chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 9. ANALYSIS RECORDS TABLE (Workflow 1)
-- Detailed analysis records for dedicated uploads
-- ============================================
CREATE TABLE IF NOT EXISTS analysis_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'report')),
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  specialist_type TEXT NOT NULL,
  ml_results JSONB,
  ocr_text TEXT,
  ai_analysis TEXT,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analysis_user_id ON analysis_records(user_id);
CREATE INDEX idx_analysis_type ON analysis_records(analysis_type);
CREATE INDEX idx_analysis_created_at ON analysis_records(created_at DESC);

-- Enable RLS
ALTER TABLE analysis_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON analysis_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert analyses"
  ON analysis_records FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 10. TRIGGER FUNCTION: Update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_reports_updated_at
  BEFORE UPDATE ON medical_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_images_updated_at
  BEFORE UPDATE ON medical_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptoms_updated_at
  BEFORE UPDATE ON symptoms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. SPECIALIST TYPES REFERENCE DATA
-- ============================================
CREATE TABLE IF NOT EXISTS specialist_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert specialist types (10 specialists)
INSERT INTO specialist_types (name, display_name, icon, description) VALUES
  ('general-physician', 'General Physician', 'FaUserMd', 'Primary care for everyday medical conditions'),
  ('cardiologist-specialist', 'Cardiologist', 'FaHeartbeat', 'Heart and cardiovascular health'),
  ('dermatologist-specialist', 'Dermatologist', 'FaSpa', 'Skin, hair, and nail conditions'),
  ('ent-specialist', 'ENT Specialist', 'FaAssistiveListeningSystems', 'Ear, nose, and throat disorders'),
  ('eye-specialist', 'Eye Specialist', 'FaEye', 'Vision and eye diseases'),
  ('orthopedic-specialist', 'Orthopedic Surgeon', 'FaXRay', 'Bones, joints, and muscles'),
  ('dentist-specialist', 'Dentist', 'FaTooth', 'Oral health and dental care'),
  ('pediatrician-specialist', 'Pediatrician', 'FaBaby', 'Child health and development'),
  ('pharmacy-assistant', 'Pharmacy Assistant', 'FaPrescriptionBottle', 'Medication information'),
  ('nutritionist-specialist', 'Nutritionist', 'FaApple', 'Diet and nutrition guidance')
ON CONFLICT (name) DO NOTHING;
```

**Action:** Run this SQL in Supabase SQL Editor

1. Go to Supabase Dashboard → Your Project
2. Navigate to SQL Editor
3. Copy the entire SQL above
4. Paste and click "Run"
5. Verify all 11 tables are created

---

### Step 1.7: Create Supabase Storage Buckets

**Action:** Create three storage buckets for file uploads

**Via Supabase Dashboard:**

1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"

**Bucket 1: medical-images**
```
Name: medical-images
Visibility: Private
File size limit: 10485760 (10MB)
Allowed MIME types: image/png, image/jpeg, image/webp
```

**Bucket 2: medical-reports**
```
Name: medical-reports
Visibility: Private
File size limit: 10485760 (10MB)
Allowed MIME types: application/pdf, image/png, image/jpeg
```

**Bucket 3: generated-reports**
```
Name: generated-reports
Visibility: Private
File size limit: 10485760 (10MB)
Allowed MIME types: application/pdf
```

**RLS Policies (Run in SQL Editor):**

```sql
-- Medical Images Bucket Policies
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Medical Reports Bucket Policies
CREATE POLICY "Users can upload own reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own reports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Generated Reports Bucket Policies
CREATE POLICY "Users can view own generated reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'generated-reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "System can upload generated reports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-reports');
```

---

### Step 1.8: Create FastAPI Main Application

**Action:** Create the main FastAPI application entry point

**File:** `backend/app/main.py`

```python
"""
AI Doctor Platform - FastAPI Backend
=====================================
Main application entry point with CORS, routes, and middleware.
Supports two workflows:
1. Dedicated Upload & Analysis
2. Chat-Integrated Analysis
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from app.routes import (
    chat_router,
    reports_router,
    images_router,
    analysis_router,
    history_router,
    auth_router,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("=" * 50)
    logger.info("🚀 Starting AI Doctor Backend...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"Backend URL: {os.getenv('BACKEND_URL', 'http://localhost:8000')}")
    logger.info(f"Frontend URL: {os.getenv('FRONTEND_URL', 'http://localhost:5173')}")
    logger.info("=" * 50)
    yield
    # Shutdown
    logger.info("👋 Shutting down AI Doctor Backend...")


# Initialize FastAPI app
app = FastAPI(
    title="AI Doctor Platform API",
    description="""
## AI Doctor Platform API

AI-powered medical consultation platform with specialist agents.

### Workflows

**Workflow 1: Dedicated Upload & Analysis**
- Upload medical images (X-ray, skin, oral, posture)
- Upload medical reports (PDF)
- Get ML/OCR analysis + AI specialist explanation
- Download PDF reports

**Workflow 2: Chat-Integrated Analysis**
- Chat with 10 specialist AI agents
- Upload files directly in conversation
- Get contextual analysis and advice
- Natural follow-up questions

### Specialists Available

- General Physician
- Cardiologist
- Dermatologist
- ENT Specialist
- Eye Specialist
- Orthopedic Surgeon
- Dentist
- Pediatrician
- Pharmacy Assistant
- Nutritionist
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:5173",
        "http://localhost:3000",
        "https://your-production-domain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(reports_router, prefix="/api/v1/reports", tags=["Medical Reports"])
app.include_router(images_router, prefix="/api/v1/images", tags=["Medical Images"])
app.include_router(analysis_router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(history_router, prefix="/api/v1/history", tags=["History"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if os.getenv("DEBUG") == "True" else "An unexpected error occurred"
        },
    )


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "workflows": {
            "dedicated_upload": "enabled",
            "chat_integrated": "enabled"
        }
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to AI Doctor Platform API",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "version": "1.0.0",
    }


# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False,
    )
```

---

### Step 1.9: Test FastAPI Server

**Action:** Verify the server starts correctly

**Commands:**
```bash
cd backend
venv\Scripts\activate  # Activate virtual environment
python app/main.py
```

**Expected Output:**
```
2024-01-15 10:30:00 - INFO - ==================================================
2024-01-15 10:30:00 - INFO - 🚀 Starting AI Doctor Backend...
2024-01-15 10:30:00 - INFO - Environment: development
2024-01-15 10:30:00 - INFO - Backend URL: http://localhost:8000
2024-01-15 10:30:00 - INFO - Frontend URL: http://localhost:5173
2024-01-15 10:30:00 - INFO - ==================================================
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Test Endpoints:**
- Open browser: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

**Expected Response from /health:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "workflows": {
    "dedicated_upload": "enabled",
    "chat_integrated": "enabled"
  }
}
```

---

### ✅ Phase 1 Completion Checklist

- [ ] Backend directory structure created
- [ ] `requirements.txt` created with all dependencies
- [ ] Python virtual environment set up
- [ ] All dependencies installed
- [ ] `.env` file created with API keys
- [ ] Frontend `.env` updated with backend URL
- [ ] Supabase database tables created (11 tables)
- [ ] Supabase storage buckets created (3 buckets)
- [ ] RLS policies configured
- [ ] FastAPI main application created
- [ ] Server starts successfully
- [ ] Health endpoint returns "healthy"

**Phase 1 Complete!** ✅

---

## 3. Phase 2: Backend Core Services

**Duration:** Days 3-5  
**Goal:** Implement all backend services (AI agents, OCR, image analysis, file upload, PDF generation)

---

### Step 2.1: Create Pydantic Models

**Action:** Define all request/response schemas for type safety

**File:** `backend/app/models/schemas.py`

```python
"""
Pydantic Models for AI Doctor Platform
======================================
Request and response schemas for all API endpoints.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum


# ============================================
# Enums
# ============================================

class SpecialistType(str, Enum):
    """Available specialist types"""
    GENERAL_PHYSICIAN = "general-physician"
    CARDIOLOGIST = "cardiologist-specialist"
    DERMATOLOGIST = "dermatologist-specialist"
    ENT_SPECIALIST = "ent-specialist"
    EYE_SPECIALIST = "eye-specialist"
    ORTHOPEDIC = "orthopedic-specialist"
    DENTIST = "dentist-specialist"
    PEDIATRICIAN = "pediatrician-specialist"
    PHARMACY = "pharmacy-assistant"
    NUTRITIONIST = "nutritionist-specialist"


class ImageType(str, Enum):
    """Medical image types"""
    XRAY = "xray"
    SKIN = "skin"
    ORAL = "oral"
    POSTURE = "posture"
    RETINA = "retina"
    OTHER = "other"


class ReportType(str, Enum):
    """Medical report types"""
    BLOOD = "blood"
    URINE = "urine"
    XRAY = "xray"
    MRI = "mri"
    CT_SCAN = "ct_scan"
    ULTRASOUND = "ultrasound"
    OTHER = "other"


class WorkflowType(str, Enum):
    """Analysis workflow types"""
    DEDICATED = "dedicated"
    CHAT = "chat"


class FileStatus(str, Enum):
    """File processing status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ============================================
# Chat Models (Workflow 2)
# ============================================

class ChatRequest(BaseModel):
    """Request for regular chat"""
    message: str = Field(..., min_length=1, max_length=5000, description="User's message")
    agent_id: str = Field(..., description="Specialist agent ID")
    session_id: Optional[str] = Field(None, description="Chat session ID")


class ChatResponse(BaseModel):
    """Response from chat"""
    response: str
    session_id: str
    sources: Optional[List[str]] = None
    timestamp: datetime = Field(default_factory=datetime.now)


class ChatMessageSchema(BaseModel):
    """Chat message for database"""
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)


class ChatSessionSchema(BaseModel):
    """Chat session for database"""
    id: str
    user_id: str
    specialist_type: str
    messages: List[ChatMessageSchema]
    created_at: datetime
    updated_at: datetime


# ============================================
# File Upload Models (Both Workflows)
# ============================================

class FileUploadResponse(BaseModel):
    """Generic file upload response"""
    file_id: str
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    public_url: str
    status: str
    created_at: datetime


# ============================================
# Report Upload Models (Workflow 1)
# ============================================

class ReportUploadResponse(BaseModel):
    """Response after uploading medical report"""
    report_id: str
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    ocr_text: Optional[str]
    structured_data: Optional[Dict[str, Any]]
    specialist_type: str
    report_type: str
    status: str
    created_at: datetime


class ReportAnalysisRequest(BaseModel):
    """Request to analyze uploaded report"""
    report_id: str
    specialist_type: str
    symptoms: Optional[str] = None


class ReportAnalysisResponse(BaseModel):
    """Response after report analysis"""
    analysis_id: str
    report_id: str
    specialist_type: str
    analysis_text: str
    diagnosis_summary: str
    recommendations: List[str]
    confidence_score: Optional[float]
    created_at: datetime


# ============================================
# Image Upload Models (Workflow 1)
# ============================================

class ImageUploadResponse(BaseModel):
    """Response after uploading medical image"""
    image_id: str
    file_name: str
    file_path: str
    image_type: str
    image_url: str
    file_size: int
    ml_results: Optional[Dict[str, Any]]
    specialist_type: str
    status: str
    created_at: datetime


class ImageAnalysisRequest(BaseModel):
    """Request to analyze uploaded image"""
    image_id: str
    image_type: str
    specialist_type: str
    symptoms: Optional[str] = None


class ImageAnalysisResponse(BaseModel):
    """Response after image analysis"""
    analysis_id: str
    image_id: str
    ml_results: Dict[str, Any]
    ai_explanation: str
    recommendations: List[str]
    confidence_score: Optional[float]
    created_at: datetime


class WebcamCaptureRequest(BaseModel):
    """Request for webcam capture"""
    image_data: str = Field(..., description="Base64 encoded image")
    image_type: str
    specialist_type: str


# ============================================
# Chat with File Upload (Workflow 2)
# ============================================

class ChatWithFileRequest(BaseModel):
    """Request for chat with file upload"""
    file_id: str
    agent_id: str
    message: str = Field("Please analyze this", description="User's message about the file")
    session_id: Optional[str] = None


class ChatWithFileResponse(BaseModel):
    """Response from chat with file"""
    response: str
    session_id: str
    attachment: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.now)


# ============================================
# Multi-Modal Analysis Models
# ============================================

class MultiModalAnalysisRequest(BaseModel):
    """Request for multi-modal analysis"""
    report_ids: Optional[List[str]] = []
    image_ids: Optional[List[str]] = []
    symptoms: str = Field(..., min_length=1, max_length=5000)
    specialist_type: str


class ComprehensiveReport(BaseModel):
    """Comprehensive health report"""
    analysis_id: str
    user_id: str
    specialist_type: str
    summary: str
    findings: List[Dict[str, Any]]
    recommendations: Dict[str, List[str]]
    lifestyle_advice: str
    pdf_url: Optional[str]
    created_at: datetime


# ============================================
# History Models
# ============================================

class ConsultationRecord(BaseModel):
    """Consultation history record"""
    id: str
    workflow_type: str
    specialist_type: str
    symptoms: Optional[str]
    report_count: int
    image_count: int
    ai_summary: Optional[str]
    created_at: datetime


class ConsultationDetail(BaseModel):
    """Detailed consultation record"""
    id: str
    workflow_type: str
    specialist_type: str
    symptoms: Optional[str]
    reports: List[Dict[str, Any]]
    images: List[Dict[str, Any]]
    ai_analysis: Optional[Dict[str, Any]]
    final_report: Optional[str]
    created_at: datetime


# ============================================
# Auth Models
# ============================================

class UserSignup(BaseModel):
    """User signup request"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    """User profile response"""
    id: str
    email: str
    full_name: Optional[str]
    date_of_birth: Optional[str]
    gender: Optional[str]
    phone: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime


class UserProfileUpdate(BaseModel):
    """User profile update request"""
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None


class TokenResponse(BaseModel):
    """Authentication token response"""
    access_token: str
    token_type: str
    user: UserProfile


# ============================================
# Common Response Models
# ============================================

class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Generic error response"""
    success: bool = False
    error: str
    detail: Optional[str] = None
```

---

**Continue to next part...**

Due to the comprehensive nature of this document, I'll continue with the remaining phases in the next file. This ensures every step is detailed without hitting token limits.
