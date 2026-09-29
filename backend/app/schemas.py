from typing import Optional

from pydantic import BaseModel, ConfigDict


class LandRecordCreate(BaseModel):
    document_id: int

    owner_name: Optional[str] = None

    survey_number: Optional[str] = None
    khasra_number: Optional[str] = None
    khata_number: Optional[str] = None

    area: Optional[str] = None
    area_unit: Optional[str] = None

    village: Optional[str] = None
    tehsil: Optional[str] = None
    district: Optional[str] = None

    land_classification: Optional[str] = None
    ownership_details: Optional[str] = None

    mutation_number: Optional[str] = None
    registration_number: Optional[str] = None

    overall_confidence: Optional[int] = None


class LandRecordResponse(LandRecordCreate):
    id: int
    validation_status: str

    model_config = ConfigDict(from_attributes=True)