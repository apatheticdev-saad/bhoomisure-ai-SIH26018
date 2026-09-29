from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LandRecord


router = APIRouter(
    prefix="/api/records",
    tags=["Records"],
)


@router.get("/")
def get_records(
    search: Optional[str] = None,
    district: Optional[str] = None,
    village: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(LandRecord)

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                LandRecord.owner_name.ilike(search_value),
                LandRecord.survey_number.ilike(search_value),
                LandRecord.khasra_number.ilike(search_value),
                LandRecord.khata_number.ilike(search_value),
                LandRecord.village.ilike(search_value),
                LandRecord.tehsil.ilike(search_value),
                LandRecord.district.ilike(search_value),
            )
        )

    if district:
        query = query.filter(
            LandRecord.district.ilike(
                district.strip()
            )
        )

    if village:
        query = query.filter(
            LandRecord.village.ilike(
                village.strip()
            )
        )

    if status:
        query = query.filter(
            LandRecord.validation_status == status
        )

    records = (
        query
        .order_by(LandRecord.id.desc())
        .limit(min(limit, 500))
        .all()
    )

    return {
        "count": len(records),
        "records": [
            {
                "id": record.id,
                "document_id": record.document_id,
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
            for record in records
        ],
    }
    