# 🏥 BT MedAI - AI-Powered Intelligent Healthcare Platform

<div align="center">

![BT MedAI](https://img.shields.io/badge/BT%20MedAI-AI%20Healthcare-0A66C2?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiAxMkwxMiAyMkwyMiAxMkwxMiAyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

**Next-Generation Virtual Hospital with AI-Powered Medical Diagnostics**

[🚀 Live Demo](#) • [📖 Documentation](#api-documentation) • [🎯 Features](#-key-features) • [💻 Installation](#-installation)

</div>

---

## 🌟 Overview

**BT MedAI** is an enterprise-grade, AI-powered healthcare platform that revolutionizes medical consultations through advanced machine learning, computer vision, and natural language processing. The platform provides real-time diagnostics, intelligent triage, and personalized medical advice through 10 specialized AI doctor agents.

### 🎯 Core Capabilities

- **🤖 10 AI Specialist Agents** - Cardiologist, Dermatologist, ENT, Ophthalmologist, Orthopedic, Dentist, Pediatrician, Pharmacist, Nutritionist, General Physician
- **📄 Intelligent Document Processing** - Advanced OCR with medical report parsing and structured data extraction
- **🖼️ Medical Image Analysis** - X-ray, skin lesion, oral health, posture assessment, and retinal imaging
- **💓 Non-Contact Vitals Monitoring** - Blood pressure estimation from facial video using rPPG technology
- **👁️ Neurological Eye Scanning** - Fatigue detection, liver health assessment, and neurological indicators
- **💊 Drug Interaction Checker** - Real-time pharmaceutical interaction analysis using RxNorm API
- **🎤 Voice-Enabled Consultations** - Speech-to-Text and Text-to-Speech with multilingual support
- **🌐 Multilingual Support** - English, Urdu, and Hindi language processing
- **🚨 AI-Powered Triage** - Intelligent emergency detection and risk classification
- **📊 Comprehensive Health Reports** - Automated PDF generation with detailed analysis

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  React 18 + Vite + TypeScript + Tailwind CSS + shadcn-ui      │
│  ├─ Voice Interface (Web Speech API)                           │
│  ├─ Webcam Capture (MediaStream API)                           │
│  ├─ Real-time Chat Interface                                   │
│  └─ Interactive Dashboards & Visualizations                    │
└────────────────────┬────────────────────────────────────────────┘
                     │ REST API (HTTPS/CORS)
┌────────────────────┴────────────────────────────────────────────┐
│                         Backend Layer                           │
│           Python 3.10 + FastAPI + Uvicorn                      │
│  ├─ AI Agent System (Google Gemini)                           │
│  ├─ OCR Engine (PyTesseract + pdfplumber)                     │
│  ├─ Computer Vision (OpenCV + MediaPipe)                      │
│  ├─ rPPG Signal Processing (BP Estimation)                    │
│  ├─ Medical Report Parser                                     │
│  └─ Drug Interaction Service (RxNorm)                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────────┐
│                      Data & Storage Layer                       │
│                    Supabase (PostgreSQL)                       │
│  ├─ User Authentication & Profiles                            │
│  ├─ Medical Records & History                                 │
│  ├─ AI Analysis Results                                       │
│  └─ File Storage (Reports, Images, PDFs)                      │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI framework with hooks and context |
| **TypeScript** | 5.8.3 | Type-safe development |
| **Vite** | 5.4.19 | Lightning-fast build tool |
| **Tailwind CSS** | 3.4.17 | Utility-first styling |
| **shadcn-ui** | Latest | Premium component library |
| **React Router** | 6.30.1 | Client-side routing |
| **TanStack Query** | 5.83.0 | Server state management |
| **React Hook Form** | 7.61.1 | Form validation |
| **Zod** | 3.25.76 | Schema validation |
| **Recharts** | 2.15.4 | Data visualization |
| **Lucide React** | 0.462.0 | Icon system |

#### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.115.0 | High-performance async API framework |
| **Python** | 3.10+ | Core backend language |
| **Uvicorn** | 0.30.6 | ASGI server |
| **Pydantic** | 2.8.0+ | Data validation |
| **Google Gemini** | 0.7.0 | AI/ML model integration |
| **PyTesseract** | 0.3.13 | OCR engine |
| **pdfplumber** | 0.11.4 | PDF text extraction |
| **OpenCV** | 4.9.0+ | Computer vision |
| **MediaPipe** | 0.10.30+ | Pose estimation & face detection |
| **Pillow** | 10.0.0+ | Image processing |
| **NumPy** | 1.26.0+ | Numerical computing |
| **ReportLab** | 4.2.2 | PDF generation |
| **Supabase** | 2.5.0 | Database client |
| **httpx** | 0.27.0 | Async HTTP client |

---

## ✨ Key Features

### 🤖 AI Specialist Agents

10 specialized AI doctors powered by Google Gemini with domain-specific knowledge:

1. **General Physician** - Primary care and general health consultations
2. **Cardiologist** - Heart and cardiovascular system specialist
3. **Dermatologist** - Skin, hair, and nail conditions expert
4. **ENT Specialist** - Ear, nose, and throat specialist
5. **Eye Specialist** - Vision and ophthalmology expert
6. **Orthopedic Surgeon** - Bone, joint, and musculoskeletal specialist
7. **Dentist** - Oral health and dental care expert
8. **Pediatrician** - Child health specialist
9. **Pharmacy Assistant** - Medication guidance and drug interactions
10. **Nutritionist** - Diet planning and nutritional counseling

### 📄 Medical Report Analysis

**Advanced OCR & Document Processing:**
- PDF and image report upload support
- Multi-page document processing
- Structured data extraction (lab values, test results)
- AI-powered text cleaning and error correction
- Automatic report type detection
- Table and chart recognition
- Handwritten text support (in development)

**Supported Report Types:**
- Blood test reports
- Urine analysis
- X-ray reports
- MRI/CT scan reports
- Ultrasound reports
- General medical documents

### 🖼️ Medical Image Analysis

**Computer Vision Capabilities:**
- **X-ray Analysis** - Bone fractures, lung conditions, abnormalities
- **Skin Lesion Detection** - Dermatological condition assessment
- **Oral Health Scanning** - Dental and gum health evaluation
- **Posture Analysis** - Joint angle detection with MediaPipe
- **Retinal Imaging** - Eye disease detection (glaucoma, diabetic retinopathy)

**Features:**
- Real-time webcam capture
- Image preprocessing and enhancement
- ML-based anomaly detection
- Visual highlighting of findings
- Confidence scoring

### 💓 Blood Pressure Estimation

**Non-Contact rPPG Technology:**
- Estimate blood pressure from 30-second facial video
- Remote photoplethysmography (rPPG) signal extraction
- Heart rate variability analysis
- No physical contact or cuff required
- Real-time processing with visual feedback

**Technical Implementation:**
- Face detection and ROI extraction
- RGB signal processing
- Pulse wave analysis
- BP estimation algorithms
- Accuracy validation

### 👁️ Neurological Eye Scanning

**Advanced Eye Analysis:**
- Fatigue and stress detection
- Liver health indicators (sclera color analysis)
- Neurological signal assessment
- Pupil response analysis
- Real-time webcam processing

### 💊 Drug Interaction Checker

**Pharmaceutical Safety:**
- Real-time drug interaction checking
- Integration with RxNorm API
- Severity classification
- Detailed interaction descriptions
- Multi-drug analysis support

### 🎤 Voice & Multilingual Support

**Voice Interface:**
- Speech-to-Text (Web Speech API)
- Text-to-Speech with natural voices
- Hands-free consultation mode
- Voice command support

**Language Support:**
- English (primary)
- Urdu (Pakistan/India)
- Hindi (India)
- Automatic language detection
- Roman Urdu support

### 🚨 Intelligent Triage System

**AI-Powered Emergency Detection:**
- Symptom severity assessment
- Risk classification (Low, Medium, High, Critical)
- Specialist recommendation
- Emergency alert system
- Priority-based routing

### 📊 Health Dashboard & History

**Patient Portal:**
- Consultation history tracking
- Previous analysis results
- Trend visualization
- Downloadable PDF reports
- Secure data storage

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.10+
- **Tesseract OCR** (for document processing)
- **Supabase Account** (for database)
- **Google Gemini API Key** (for AI agents)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/btmedai-main.git
cd btmedai-main

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys and configuration

# Start FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Environment Variables

#### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:8000
```

#### Backend (.env)
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Application Settings
ENVIRONMENT=development
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
DEBUG=True

# Tesseract OCR Path (Windows)
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

### Docker Deployment

```bash
# Build and run with Docker
cd backend
docker build -t btmedai-backend .
docker run -p 7860:7860 --env-file .env btmedai-backend
```

---

## 📖 API Documentation

### Base URL
```
Development: http://localhost:8000
Production: https://your-domain.com
```

### Interactive API Docs
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Chat & Consultation
```http
POST /api/v1/chat/
POST /api/v1/chat/analyze
GET  /api/v1/chat/agents
```

#### Medical Reports
```http
POST /api/v1/reports/upload
POST /api/v1/reports/analyze
GET  /api/v1/reports/{report_id}
```

#### Medical Images
```http
POST /api/v1/images/upload
POST /api/v1/images/analyze
POST /api/v1/images/webcam-capture
```

#### Blood Pressure Estimation
```http
POST /api/v1/bp/estimate
```

#### Eye Scan
```http
POST /api/v1/eye-scan/analyze
```

#### Drug Interactions
```http
POST /api/v1/drugs/check-interaction
```

#### History & Analysis
```http
GET  /api/v1/history/consultations
GET  /api/v1/analysis/{analysis_id}
```

#### Authentication
```http
POST /api/v1/auth/signup
POST /api/v1/auth/login
GET  /api/v1/auth/profile
PUT  /api/v1/auth/profile
```

---

## 🎯 Usage Examples

### Chat with AI Specialist

```typescript
import { supabase } from '@/integrations/supabase/client'

const consultSpecialist = async () => {
  const response = await fetch('http://localhost:8000/api/v1/chat/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: "I have chest pain and shortness of breath",
      agent_id: "cardiologist-specialist",
      session_id: "unique-session-id"
    })
  })
  const data = await response.json()
  console.log(data.response)
}
```

### Upload Medical Report

```typescript
const uploadReport = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('specialist_type', 'general-physician')
  formData.append('report_type', 'blood')
  
  const response = await fetch('http://localhost:8000/api/v1/reports/upload', {
    method: 'POST',
    body: formData
  })
  const data = await response.json()
  return data
}
```

### Estimate Blood Pressure

```typescript
const estimateBP = async (frames: string[]) => {
  const response = await fetch('http://localhost:8000/api/v1/bp/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      frames: frames, // Base64 encoded video frames
      duration: 30
    })
  })
  const data = await response.json()
  return data
}
```

---

## 🔒 Security & Compliance

- **HTTPS/SSL** encryption for all communications
- **JWT-based authentication** via Supabase
- **Row-level security** in database
- **CORS protection** with whitelist
- **Input validation** with Pydantic
- **File upload restrictions** (size, type)
- **Rate limiting** on API endpoints
- **HIPAA-compliant** data handling practices
- **Encrypted file storage** in Supabase

**⚠️ Medical Disclaimer**: This platform provides AI-assisted medical information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.

---

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd backend
pytest

# Linting
npm run lint
```

---

## 📦 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Backend (Render/Railway/AWS)

**Render:**
1. Connect GitHub repository
2. Select `backend` directory
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

**Docker:**
```bash
docker build -t btmedai-backend ./backend
docker push your-registry/btmedai-backend
```

---

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ 10 AI Specialist Agents
- ✅ Medical Report OCR & Analysis
- ✅ Medical Image Analysis
- ✅ Blood Pressure Estimation
- ✅ Eye Scan Analysis
- ✅ Drug Interaction Checker
- ✅ Voice Interface
- ✅ Multilingual Support

### Phase 2 (In Progress)
- 🔄 Advanced table extraction from PDFs
- 🔄 Handwritten text recognition
- 🔄 Multi-page report correlation
- 🔄 Trend analysis over time
- 🔄 Enhanced pose estimation exercises

### Phase 3 (Planned)
- 📋 Wearable device integration
- 📋 Real-time vital monitoring
- 📋 Telemedicine video calls
- 📋 Prescription management
- 📋 Appointment scheduling
- 📋 Insurance integration

### Phase 4 (Future)
- 📋 Mobile applications (iOS/Android)
- 📋 Offline mode support
- 📋 Advanced predictive analytics
- 📋 Integration with EHR systems
- 📋 Multi-tenant architecture

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript/Python best practices
- Write unit tests for new features
- Update documentation
- Follow existing code style
- Add comments for complex logic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**BT MedAI Development Team**
- Lead Developer: [Your Name]
- AI/ML Engineer: [Name]
- Backend Engineer: [Name]
- Frontend Engineer: [Name]
- Medical Advisor: [Name]

---

## 📞 Support

- **Email**: support@btmedai.com
- **Documentation**: [docs.btmedai.com](#)
- **Issues**: [GitHub Issues](https://github.com/yourusername/btmedai-main/issues)
- **Discord**: [Join our community](#)

---

## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **Supabase** for backend infrastructure
- **FastAPI** for the excellent framework
- **shadcn-ui** for beautiful components
- **OpenCV** and **MediaPipe** for computer vision
- **RxNorm** for drug interaction data
- All open-source contributors

---

<div align="center">

**Built with ❤️ by the BT MedAI Team**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/btmedai-main?style=social)](https://github.com/yourusername/btmedai-main)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/btmedai-main?style=social)](https://github.com/yourusername/btmedai-main)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/btmedai-main)](https://github.com/yourusername/btmedai-main/issues)

</div>
