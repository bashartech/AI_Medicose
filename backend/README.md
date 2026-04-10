# 🏥 AI Doctor Platform - Backend

Python + FastAPI backend for the AI Doctor Platform with specialist AI agents.

## Features

- **10 Specialist AI Agents** powered by Google Gemini API
- **Two Workflows**:
  - Workflow 1: Dedicated Upload & Analysis (images + reports)
  - Workflow 2: Chat-Integrated Analysis (file upload in conversation)
- **Medical Image Analysis**: X-ray, skin, oral, posture
- **OCR for Reports**: Blood, urine, lab report text extraction
- **Supabase Integration**: Database + Storage
- **PDF Report Generation**: Downloadable analysis reports

## Quick Start

### Prerequisites

- Python 3.8+
- Supabase account
- Google Gemini API key

### Installation

1. **Create virtual environment:**
```bash
cd backend
python -m venv venv
```

2. **Activate virtual environment:**

Windows:
```bash
venv\Scripts\activate
```

Linux/Mac:
```bash
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
- Copy `.env.example` to `.env`
- Add your API keys:
  - `GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
  - `TAVILY_API_KEY` (optional) - Get from [Tavily](https://tavily.com/)

5. **Run Supabase migrations:**
- Go to Supabase Dashboard → SQL Editor
- Run the SQL from `supabase/migrations/001_create_medical_tables.sql`

6. **Create Supabase Storage buckets:**
- Go to Supabase Dashboard → Storage
- Create buckets: `medical-images`, `medical-reports`, `generated-reports`

7. **Start the server:**
```bash
python app/main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry
│   ├── agents/
│   │   ├── base_agent.py       # Base AI agent class
│   │   ├── registry.py         # Agent registry
│   │   └── specialists/        # 10 specialist agents
│   ├── services/
│   │   ├── ocr_service.py      # PDF/image text extraction
│   │   ├── image_analysis_service.py  # ML image analysis
│   │   ├── file_service.py     # Supabase Storage
│   │   └── pdf_service.py      # PDF generation
│   ├── routes/
│   │   ├── chat_router.py      # Chat endpoints
│   │   ├── images_router.py    # Image upload
│   │   ├── reports_router.py   # Report upload
│   │   ├── analysis_router.py  # Multi-modal analysis
│   │   ├── history_router.py   # History endpoints
│   │   └── auth_router.py      # Auth endpoints
│   └── models/
│       └── schemas.py          # Pydantic models
├── requirements.txt
└── .env
```

## Available Specialists

1. General Physician
2. Cardiologist
3. Dermatologist
4. ENT Specialist
5. Eye Specialist
6. Orthopedic Surgeon
7. Dentist
8. Pediatrician
9. Pharmacy Assistant
10. Nutritionist

## Environment Variables

```env
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Application
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
DEBUG=True

# Model
DEFAULT_GEMINI_MODEL=gemini-2.0-flash
```

## Development

### Run with auto-reload:
```bash
python app/main.py
```

### Run with uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Testing:
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test API docs
open http://localhost:8000/docs
```

## Deployment

### Render
1. Create new Web Service
2. Connect GitHub repository
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### Docker
```bash
docker build -t ai-doctor-backend .
docker run -p 8000:8000 --env-file .env ai-doctor-backend
```

## License

MIT

## Support

For issues or questions, please refer to the documentation in the `docs/` folder.
