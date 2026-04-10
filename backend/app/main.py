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
        "http://localhost:8081",
        "http://localhost:8080",
        "https://your-production-domain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
  
# Include routers
from app.routes.chat_router import router as chat_router
from app.routes.reports_router import router as reports_router
from app.routes.images_router import router as images_router
from app.routes.analysis_router import router as analysis_router
from app.routes.history_router import router as history_router
from app.routes.auth_router import router as auth_router
from app.routes.drug_router import router as drug_router
from app.routes.bp_router import router as bp_router
from app.routes.eye_scan_router import router as eye_scan_router

app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(reports_router, prefix="/api/v1/reports", tags=["Medical Reports"])
app.include_router(images_router, prefix="/api/v1/images", tags=["Medical Images"])
app.include_router(analysis_router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(history_router, prefix="/api/v1/history", tags=["History"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(drug_router, prefix="/api/v1/drugs", tags=["Drug Interactions"])
app.include_router(bp_router, prefix="/api/v1/bp", tags=["Blood Pressure Estimation"])
app.include_router(eye_scan_router, prefix="/api/v1/eye-scan", tags=["Neurological Eye Scan"])


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
