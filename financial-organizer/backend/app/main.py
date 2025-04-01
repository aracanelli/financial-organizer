from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.api import api_router
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base

# Commented out: we'll use Alembic for database migrations instead
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Financial Organizer API",
    description="API for organizing financial transactions and receipts",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router under the versioned path
app.include_router(api_router, prefix=settings.API_V1_STR)

# BACKWARD COMPATIBILITY: Include the same router under the non-versioned path
# This will allow old API calls to /api/transactions/ to work while we transition
app.include_router(api_router, prefix="/api")

# Mount static files directory for uploaded receipts if it exists
uploads_dir = os.path.join(os.getcwd(), "uploads")
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "0.1.0"} 