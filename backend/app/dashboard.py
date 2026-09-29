from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Document,
    LandRecord,
    ValidationResult,
)


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # DOCUMENT COUNTS
    # -----------------------------------------------------

    total_documents = (
        db.query(Document)
        .count()
    )

    processed_documents = (
        db.query(Document)
        .filter(
            Document.status == "processed"
        )
        .count()
    )

    processing_documents = (
        db.query(Document)
        .filter(
            Document.status == "processing"
        )
        .count()
    )

    failed_documents = (
        db.query(Document)
        .filter(
            Document.status == "ocr_failed"
        )
        .count()
    )

    # -----------------------------------------------------
    # RECORD COUNTS
    # -----------------------------------------------------

    total_records = (
        db.query(LandRecord)
        .count()
    )

    verified_records = (
        db.query(LandRecord)
        .filter(
            LandRecord.validation_status == "verified"
        )
        .count()
    )

    pending_records = (
        db.query(LandRecord)
        .filter(
            LandRecord.validation_status == "needs_review"
        )
        .count()
    )

    rejected_records = (
        db.query(LandRecord)
        .filter(
            LandRecord.validation_status == "rejected"
        )
        .count()
    )

    # -----------------------------------------------------
    # AVERAGE CONFIDENCE
    # -----------------------------------------------------

    average_confidence = (
        db.query(
            func.avg(
                LandRecord.overall_confidence
            )
        )
        .scalar()
    )

    if average_confidence is None:
        average_confidence = 0
    else:
        average_confidence = round(
            float(average_confidence),
            1
        )

    # -----------------------------------------------------
    # VALIDATION ISSUES
    # -----------------------------------------------------

    validation_failures = (
        db.query(ValidationResult)
        .filter(
            ValidationResult.status == "failed"
        )
        .count()
    )

    validation_warnings = (
        db.query(ValidationResult)
        .filter(
            ValidationResult.status == "warning"
        )
        .count()
    )

    # -----------------------------------------------------
    # RECENT DOCUMENTS
    # -----------------------------------------------------

    recent_documents = (
        db.query(Document)
        .order_by(
            Document.id.desc()
        )
        .limit(10)
        .all()
    )

    recent = []

    for document in recent_documents:

        record = (
            db.query(LandRecord)
            .filter(
                LandRecord.document_id == document.id
            )
            .first()
        )

        recent.append({
            "document_id": document.id,
            "file_name": document.file_name,
            "document_type": document.document_type,
            "status": document.status,
            "uploaded_at": document.uploaded_at,
            "processed_at": document.processed_at,
            "confidence": (
                record.overall_confidence
                if record else None
            ),
            "validation_status": (
                record.validation_status
                if record else None
            ),
        })

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "documents": {
            "total": total_documents,
            "processed": processed_documents,
            "processing": processing_documents,
            "failed": failed_documents,
        },

        "records": {
            "total": total_records,
            "verified": verified_records,
            "pending_verification": pending_records,
            "rejected": rejected_records,
        },

        "confidence": {
            "average": average_confidence,
        },

        "validation": {
            "failures": validation_failures,
            "warnings": validation_warnings,
        },

        "recent_documents": recent,
    }