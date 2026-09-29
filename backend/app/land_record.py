from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LandRecord, Document
from app.schemas import LandRecordCreate, LandRecordResponse


router = APIRouter(
    prefix="/api/land-records",
    tags=["Land Records"]
)


# =========================================================
# CREATE LAND RECORD
# =========================================================

@router.post("/", response_model=LandRecordResponse)
def create_land_record(
    record: LandRecordCreate,
    db: Session = Depends(get_db)
):
    new_record = LandRecord(**record.model_dump())

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return new_record


# =========================================================
# GET ALL LAND RECORDS
# =========================================================

@router.get("/")
def get_land_records(
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = (
        db.query(LandRecord, Document)
        .join(
            Document,
            LandRecord.document_id == Document.id
        )
    )

    # Search by owner, survey, village, district or document name
    if search:
        search_pattern = f"%{search}%"

        query = query.filter(
            (LandRecord.owner_name.ilike(search_pattern))
            | (LandRecord.survey_number.ilike(search_pattern))
            | (LandRecord.khasra_number.ilike(search_pattern))
            | (LandRecord.khata_number.ilike(search_pattern))
            | (LandRecord.village.ilike(search_pattern))
            | (LandRecord.district.ilike(search_pattern))
            | (Document.file_name.ilike(search_pattern))
        )

    # Filter by validation status
    if status and status != "all":
        query = query.filter(
            LandRecord.validation_status == status
        )

    results = (
        query
        .order_by(LandRecord.id.desc())
        .all()
    )

    return {
        "count": len(results),
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
                "created_at": record.created_at,
                "updated_at": record.updated_at,
            }
            for record, document in results
        ]
    }


# =========================================================
# GET SINGLE LAND RECORD
# =========================================================

@router.get("/{record_id}", response_model=LandRecordResponse)
def get_land_record(
    record_id: int,
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

    return record