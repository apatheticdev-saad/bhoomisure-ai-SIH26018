from pathlib import Path
import shutil
from uuid import uuid4
from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Document,
    LandRecord,
    ExtractedField,
    ValidationResult,
)
from app.ocr_service import extract_text
from app.extraction_service import extract_land_fields
from app.confidence_service import (
    calculate_field_confidence,
    calculate_overall_confidence,
)
from app.validation_service import (
    validate_land_record,
    determine_validation_status,
)
from app.reconciliation_service import reconcile_land_record


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


# ============================================================
# STORAGE
# ============================================================

UPLOAD_DIR = (
    Path(__file__).resolve().parents[2]
    / "storage"
    / "uploads"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# ALLOWED VALUES
# ============================================================

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}

ALLOWED_DOCUMENT_TYPES = {
    "7/12",
    "8A",
    "Ferfar",
}

ALLOWED_LANGUAGES = {
    "Marathi + English",
    "Marathi",
    "English",
}


# ============================================================
# GET ORIGINAL DOCUMENT FILE
# ============================================================

@router.get("/{document_id}/file")
def get_document_file(
    document_id: int,
    db: Session = Depends(get_db),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    file_path = Path(document.file_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Document file not found",
        )

    return FileResponse(
        path=str(file_path),
        filename=document.file_name,
    )


# ============================================================
# UPLOAD DOCUMENT
# ============================================================

@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("unknown"),
    language: str = Form("English"),
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # Validate filename
    # --------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected",
        )

    # --------------------------------------------------------
    # Validate extension
    # --------------------------------------------------------

    extension = Path(
        file.filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only PDF, JPG, JPEG and PNG "
                "files are allowed"
            ),
        )

    # --------------------------------------------------------
    # Validate document type
    # --------------------------------------------------------

    if document_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid document type. "
                "Allowed values: 7/12, 8A, Ferfar"
            ),
        )

    # --------------------------------------------------------
    # Validate language
    # --------------------------------------------------------

    if language not in ALLOWED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid language. "
                "Allowed values: "
                "Marathi + English, Marathi, English"
            ),
        )

    # --------------------------------------------------------
    # Generate unique storage filename
    # --------------------------------------------------------

    unique_name = (
        f"{uuid4().hex}{extension}"
    )

    file_path = (
        UPLOAD_DIR / unique_name
    )

    # --------------------------------------------------------
    # Save physical file
    # --------------------------------------------------------

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer,
        )

    # --------------------------------------------------------
    # Create document database record
    # --------------------------------------------------------

    document = Document(
        file_name=file.filename,
        file_path=str(file_path),
        document_type=document_type,
        language=language,
        status="uploaded",
        uploaded_by=None,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Document uploaded successfully",
        "document_id": document.id,
        "file_name": document.file_name,
        "document_type": document.document_type,
        "language": document.language,
        "status": document.status,
    }


# ============================================================
# PROCESS DOCUMENT
# ============================================================

@router.post("/{document_id}/process")
def process_document(
    document_id: int,
    db: Session = Depends(get_db),
):

    # ========================================================
    # 1. FIND DOCUMENT
    # ========================================================

    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    # ========================================================
    # 2. MARK PROCESSING
    # ========================================================

    document.status = "processing"

    db.commit()

    # ========================================================
    # 3. OCR
    # ========================================================

    text = extract_text(
        document.file_path
    )

    if not text:

        document.status = "ocr_failed"

        db.commit()

        return {
            "document_id": document.id,
            "status": "ocr_failed",
            "raw_text": "",
            "extracted_data": {},
            "message": (
                "No text could be extracted "
                "from the document"
            ),
        }

    # ========================================================
    # 4. STRUCTURED EXTRACTION
    # ========================================================

    extracted_data = extract_land_fields(
        text
    )

    # ========================================================
    # 5. FIELD CONFIDENCE
    # ========================================================

    field_confidence = {}

    for field_name, value in extracted_data.items():

        field_confidence[field_name] = (
            calculate_field_confidence(value)
        )

    overall_confidence = (
        calculate_overall_confidence(
            extracted_data
        )
    )

    # ========================================================
    # 6. BASIC VALIDATION
    # ========================================================

    validation_results = (
        validate_land_record(
            extracted_data
        )
    )

    # ========================================================
    # 7. CREATE / UPDATE CURRENT LAND RECORD
    # ========================================================
    #
    # We create/update the current record BEFORE
    # reconciliation so we know its ID.
    #
    # That ID is then excluded from reconciliation,
    # preventing a record from comparing against itself.
    # ========================================================

    land_record = (
        db.query(LandRecord)
        .filter(
            LandRecord.document_id
            == document.id
        )
        .first()
    )

    if land_record:

        # Update extracted fields

        for field_name, value in (
            extracted_data.items()
        ):

            if hasattr(
                land_record,
                field_name,
            ):

                setattr(
                    land_record,
                    field_name,
                    value,
                )

    else:

        land_record = LandRecord(
            document_id=document.id,
            **extracted_data,
            overall_confidence=(
                overall_confidence
            ),
            validation_status="processing",
        )

        db.add(land_record)

    # Make sure SQLAlchemy assigns the ID.
    db.flush()

    # ========================================================
    # 8. CROSS-RECORD RECONCILIATION
    # ========================================================

    reconciliation_result = (
        reconcile_land_record(
            db=db,
            new_data=extracted_data,
            exclude_record_id=land_record.id,
        )
    )

    # ========================================================
    # 9. CONVERT RECONCILIATION INTO VALIDATION
    # ========================================================

    if (
        reconciliation_result["status"]
        == "no_match"
    ):

        validation_results.append(
            {
                "rule_name": (
                    "cross_record_comparison"
                ),
                "status": "passed",
                "severity": "info",
                "message": (
                    "No existing matching parcel "
                    "was found. No cross-record "
                    "conflict detected."
                ),
            }
        )

    elif (
        reconciliation_result["status"]
        == "matched"
    ):

        validation_results.append(
            {
                "rule_name": (
                    "cross_record_comparison"
                ),
                "status": "passed",
                "severity": "info",
                "message": (
                    "Existing parcel found and "
                    "compared. No field mismatch "
                    "detected."
                ),
            }
        )

    elif (
        reconciliation_result["status"]
        == "conflict"
    ):

        validation_results.append(
            {
                "rule_name": (
                    "cross_record_comparison"
                ),
                "status": "failed",
                "severity": "high",
                "message": (
                    "Potential conflict detected. "
                    f"{len(reconciliation_result['mismatches'])} "
                    "field mismatch(es) found "
                    "against existing land "
                    "record(s)."
                ),
            }
        )

    # ========================================================
    # 10. REMOVE OLD PLACEHOLDER RULE
    # ========================================================
    #
    # survey_reference_check was only a placeholder.
    # Real comparison is now performed above.
    # ========================================================

    validation_results = [
        result
        for result in validation_results
        if result["rule_name"]
        != "survey_reference_check"
    ]

    # ========================================================
    # 11. DETERMINE FINAL STATUS
    # ========================================================

    validation_status = (
        determine_validation_status(
            validation_results,
            overall_confidence,
        )
    )

    # Any cross-record conflict requires
    # human verification.

    if (
        reconciliation_result["status"]
        == "conflict"
    ):

        validation_status = "needs_review"

    # Update current land record.

    land_record.overall_confidence = (
        overall_confidence
    )

    land_record.validation_status = (
        validation_status
    )

    # ========================================================
    # 12. CLEAR OLD CHILD DATA WHEN REPROCESSING
    # ========================================================

    land_record.extracted_fields.clear()

    land_record.validation_results.clear()

    db.flush()

    # ========================================================
    # 13. SAVE EXTRACTED FIELDS
    # ========================================================

    for field_name, value in (
        extracted_data.items()
    ):

        db.add(
            ExtractedField(
                record_id=land_record.id,
                field_name=field_name,
                field_value=value,
                confidence=(
                    field_confidence[field_name]
                ),
                source_text=text[:1000],
            )
        )

    # ========================================================
    # 14. SAVE VALIDATION RESULTS
    # ========================================================

    for result in validation_results:

        db.add(
            ValidationResult(
                record_id=land_record.id,
                rule_name=result["rule_name"],
                status=result["status"],
                severity=result["severity"],
                message=result["message"],
            )
        )

    # ========================================================
    # 15. COMPLETE PROCESSING
    # ========================================================

    document.status = "processed"

    document.processed_at = (
        datetime.now(timezone.utc)
    )

    db.commit()

    db.refresh(land_record)

    # ========================================================
    # 16. FINAL API RESPONSE
    # ========================================================

    return {
        "document_id": document.id,
        "record_id": land_record.id,
        "status": "processed",

        "document": {
            "file_name": document.file_name,
            "document_type": document.document_type,
            "language": document.language,
        },

        "processing_result": {
            "ocr": "completed",
            "extraction": "completed",
            "validation": "completed",
            "reconciliation": "completed",
        },

        "overall_confidence": (
            overall_confidence
        ),

        "validation_status": (
            validation_status
        ),

        "field_confidence": (
            field_confidence
        ),

        "extracted_data": (
            extracted_data
        ),

        "validation_results": (
            validation_results
        ),

        "reconciliation": (
            reconciliation_result
        ),

        "raw_text": text,
    }