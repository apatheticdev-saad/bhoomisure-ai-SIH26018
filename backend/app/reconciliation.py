from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LandRecord
from app.reconciliation_service import reconcile_land_record


router = APIRouter(
    prefix="/api/reconciliation",
    tags=["Reconciliation"],
)


@router.get("/{record_id}")
def get_reconciliation(
    record_id: int,
    db: Session = Depends(get_db),
):
    record = db.query(LandRecord).filter(
        LandRecord.id == record_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Land record not found",
        )

    data = {
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
    }

    result = reconcile_land_record(
        db=db,
        new_data=data,
        exclude_record_id=record.id,
    )

    return {
        "record_id": record.id,
        "validation_status": record.validation_status,
        "reconciliation": result,
    }