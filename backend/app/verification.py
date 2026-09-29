from datetime import datetime, timezone
import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    LandRecord,
    AuditLog,
    Document,
    ValidationResult,
)
from app.integrity_service import create_integrity_block


router = APIRouter(
    prefix="/api/verification",
    tags=["Human Verification"]
)


class VerificationUpdate(BaseModel):
    owner_name: str | None = None
    survey_number: str | None = None
    khasra_number: str | None = None
    khata_number: str | None = None
    area: str | None = None
    area_unit: str | None = None
    village: str | None = None
    tehsil: str | None = None
    district: str | None = None
    land_classification: str | None = None
    ownership_details: str | None = None
    mutation_number: str | None = None
    registration_number: str | None = None
    action: str


FIELDS = [
    "owner_name",
    "survey_number",
    "khasra_number",
    "khata_number",
    "area",
    "area_unit",
    "village",
    "tehsil",
    "district",
    "land_classification",
    "ownership_details",
    "mutation_number",
    "registration_number",
]


# =========================================================
# PENDING VERIFICATION QUEUE
# =========================================================

@router.get("/pending")
def get_pending_verification(
    db: Session = Depends(get_db)
):
    records = (
        db.query(LandRecord, Document)
        .join(
            Document,
            LandRecord.document_id == Document.id
        )
        .filter(
            LandRecord.validation_status == "needs_review"
        )
        .order_by(LandRecord.id.desc())
        .all()
    )

    return {
        "count": len(records),
        "records": [
            {
                "id": record.id,
                "document_id": record.document_id,
                "file_name": document.file_name,
                "document_type": document.document_type,

                "owner_name": record.owner_name,
                "survey_number": record.survey_number,
                "khasra_number": record.khasra_number,
                "khata_number": record.khata_number,

                "area": record.area,
                "area_unit": record.area_unit,

                "village": record.village,
                "tehsil": record.tehsil,
                "district": record.district,

                "land_classification": record.land_classification,
                "ownership_details": record.ownership_details,
                "mutation_number": record.mutation_number,
                "registration_number": record.registration_number,

                "overall_confidence": record.overall_confidence,
                "validation_status": record.validation_status,
            }
            for record, document in records
        ]
    }


# =========================================================
# GET RECORD FOR VERIFICATION
# =========================================================

@router.get("/{record_id}")
def get_verification_record(
    record_id: int,
    db: Session = Depends(get_db)
):
    result = (
        db.query(LandRecord, Document)
        .join(
            Document,
            LandRecord.document_id == Document.id
        )
        .filter(LandRecord.id == record_id)
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Land record not found"
        )

    record, document = result

    validations = (
        db.query(ValidationResult)
        .filter(
            ValidationResult.record_id == record.id
        )
        .order_by(ValidationResult.id.asc())
        .all()
    )

    extracted_data = {
        field: getattr(record, field)
        for field in FIELDS
    }

    return {
        "id": record.id,
        "document_id": record.document_id,

        "document": {
            "file_name": document.file_name,
            "document_type": document.document_type,
            "language": document.language,
            "status": document.status,
            "file_url": f"/api/documents/{document.id}/file",
        },

        "extracted_data": extracted_data,

        "overall_confidence": record.overall_confidence,

        "validation_status": record.validation_status,

        "validation_results": [
            {
                "id": validation.id,
                "rule_name": validation.rule_name,
                "status": validation.status,
                "severity": validation.severity,
                "message": validation.message,
                "created_at": validation.created_at,
            }
            for validation in validations
        ],
    }


# =========================================================
# APPROVE / CORRECT / REJECT
# =========================================================

@router.put("/{record_id}")
def verify_record(
    record_id: int,
    update: VerificationUpdate,
    db: Session = Depends(get_db)
):
    record = (
        db.query(LandRecord)
        .filter(LandRecord.id == record_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Land record not found"
        )

    allowed_actions = {
        "approve",
        "correct",
        "reject",
    }

    if update.action not in allowed_actions:
        raise HTTPException(
            status_code=400,
            detail="Action must be approve, correct or reject"
        )

    previous_status = record.validation_status

    changed_fields = {}

    # =====================================================
    # UPDATE LAND RECORD FIELDS
    # =====================================================

    for field in FIELDS:

        new_value = getattr(update, field)

        if new_value is None:
            continue

        old_value = getattr(record, field)

        if old_value != new_value:
            changed_fields[field] = {
                "old": old_value,
                "new": new_value,
            }

        setattr(record, field, new_value)

    # =====================================================
    # UPDATE VERIFICATION STATUS
    # =====================================================

    if update.action == "approve":
        record.validation_status = "verified"

    elif update.action == "correct":
        record.validation_status = "verified"

    elif update.action == "reject":
        record.validation_status = "rejected"

    record.updated_at = datetime.now(timezone.utc)

    # =====================================================
    # CREATE AUDIT LOG
    # =====================================================

    audit_details = {
        "action": update.action,
        "changed_fields": changed_fields,
        "previous_status": previous_status,
        "new_status": record.validation_status,
    }

    audit_log = AuditLog(
        user_id=None,
        action=f"record_{update.action}",
        entity_type="land_record",
        entity_id=record.id,
        details=json.dumps(
            audit_details,
            ensure_ascii=False
        ),
    )

    db.add(audit_log)

    # =====================================================
    # CREATE SHA-256 INTEGRITY BLOCK
    # =====================================================

    integrity_block = None

    if update.action in ["approve", "correct"]:

        integrity_block = create_integrity_block(
            db=db,
            record=record
        )

    # =====================================================
    # COMMIT EVERYTHING
    # =====================================================

    db.commit()

    db.refresh(record)

    if integrity_block:
        db.refresh(integrity_block)

    # =====================================================
    # RESPONSE
    # =====================================================

    response = {
        "message": "Verification action completed",
        "record_id": record.id,
        "action": update.action,
        "validation_status": record.validation_status,
        "changed_fields": changed_fields,
        "audit_log_created": True,
        "integrity_block_created": integrity_block is not None,
        "updated_at": record.updated_at,
    }

    # Add integrity information when a block was created
    if integrity_block:

        response["integrity"] = {
            "block_number": integrity_block.block_number,
            "data_hash": integrity_block.data_hash,
            "previous_hash": integrity_block.previous_hash,
            "current_hash": integrity_block.current_hash,
        }

    return response