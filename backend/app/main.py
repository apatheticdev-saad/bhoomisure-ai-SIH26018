from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app import models
from app.database import Base, engine

from app.land_record import router as land_record_router
from app.document import router as document_router
from app.verification import router as verification_router
from app.audit import router as audit_router
from app.dashboard import router as dashboard_router
from app.integrity import router as integrity_router
from app.reconciliation import router as reconciliation_router
from app.records import router as records_router
app = FastAPI(
    title="BhoomiSure AI",
    description="Intelligent Land Record Digitization and Validation System",
    version="0.1.0",
)


# ---------------------------------------------------------
# CORS
# Allows the Next.js frontend to communicate with FastAPI
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Database
# ---------------------------------------------------------

Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------
# API Routers
# ---------------------------------------------------------

app.include_router(land_record_router)
app.include_router(document_router)
app.include_router(verification_router)
app.include_router(audit_router)
app.include_router(dashboard_router)
app.include_router(integrity_router)
app.include_router(reconciliation_router)
app.include_router(records_router)

# ---------------------------------------------------------
# Basic endpoints
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "BhoomiSure AI backend is running",
        "status": "online",
        "version": "0.1.0",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BhoomiSure AI API",
    }


@app.get("/api/db-test")
def database_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {
            "status": "success",
            "database": "bhoomisure_db",
            "connection": result.scalar() == 1,
        }