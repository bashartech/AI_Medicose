#!/usr/bin/env python
"""
Start the AI Doctor Platform backend server.
Run this from the backend directory.
"""

import uvicorn
import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    print("=" * 50)
    print("🏥 AI Doctor Platform Backend Server")
    print("=" * 50)
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"🔗 API Docs: http://localhost:8000/docs")
    print(f"🔗 Health Check: http://localhost:8000/health")
    print("=" * 50)
    print("")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False,
    )
