from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


# =========================================================
# DOCUMENT
# =========================================================

class Document(Base):
    __tablename__ = "documents"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    file_name = Column(
        String(255),
        nullable=False
    )

    file_path = Column(
        String(500),
        nullable=False
    )

    document_type = Column(
        String(50),
        nullable=False
    )

    language = Column(
        String(50),
        nullable=True
    )

    status = Column(
        String(50),
        default="uploaded",
        nullable=False
    )

    uploaded_by = Column(
        Integer,
        nullable=True
    )

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    processed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    land_records = relationship(
        "LandRecord",
        back_populates="document",
        cascade="all, delete-orphan"
    )


# =========================================================
# LAND RECORD
# =========================================================

class LandRecord(Base):
    __tablename__ = "land_records"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False,
        index=True
    )

    owner_name = Column(
        String(255),
        nullable=True
    )

    survey_number = Column(
        String(100),
        nullable=True
    )

    khasra_number = Column(
        String(100),
        nullable=True
    )

    khata_number = Column(
        String(100),
        nullable=True
    )

    area = Column(
        String(100),
        nullable=True
    )

    area_unit = Column(
        String(50),
        nullable=True
    )

    village = Column(
        String(150),
        nullable=True
    )

    tehsil = Column(
        String(150),
        nullable=True
    )

    district = Column(
        String(150),
        nullable=True
    )

    land_classification = Column(
        String(150),
        nullable=True
    )

    ownership_details = Column(
        String(500),
        nullable=True
    )

    mutation_number = Column(
        String(100),
        nullable=True
    )

    registration_number = Column(
        String(100),
        nullable=True
    )

    overall_confidence = Column(
        Integer,
        nullable=True
    )

    validation_status = Column(
        String(50),
        default="pending",
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    document = relationship(
        "Document",
        back_populates="land_records"
    )

    extracted_fields = relationship(
        "ExtractedField",
        back_populates="land_record",
        cascade="all, delete-orphan"
    )

    validation_results = relationship(
        "ValidationResult",
        back_populates="land_record",
        cascade="all, delete-orphan"
    )


# =========================================================
# EXTRACTED FIELD
# =========================================================

class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    record_id = Column(
        Integer,
        ForeignKey("land_records.id"),
        nullable=False,
        index=True
    )

    field_name = Column(
        String(100),
        nullable=False
    )

    field_value = Column(
        String(500),
        nullable=True
    )

    confidence = Column(
        Integer,
        nullable=True
    )

    source_text = Column(
        String(1000),
        nullable=True
    )

    land_record = relationship(
        "LandRecord",
        back_populates="extracted_fields"
    )


# =========================================================
# VALIDATION RESULT
# =========================================================

class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    record_id = Column(
        Integer,
        ForeignKey("land_records.id"),
        nullable=False,
        index=True
    )

    rule_name = Column(
        String(150),
        nullable=False
    )

    status = Column(
        String(50),
        nullable=False
    )

    severity = Column(
        String(50),
        nullable=True
    )

    message = Column(
        String(1000),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    land_record = relationship(
        "LandRecord",
        back_populates="validation_results"
    )


# =========================================================
# AUDIT LOG
# =========================================================

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=True
    )

    action = Column(
        String(100),
        nullable=False
    )

    entity_type = Column(
        String(100),
        nullable=False
    )

    entity_id = Column(
        Integer,
        nullable=False
    )

    details = Column(
        String(2000),
        nullable=True
    )

    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# =========================================================
# INTEGRITY BLOCK
# =========================================================

class IntegrityBlock(Base):
    __tablename__ = "integrity_blocks"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    record_id = Column(
        Integer,
        ForeignKey("land_records.id"),
        nullable=False,
        index=True
    )

    block_number = Column(
        Integer,
        nullable=False,
        unique=True
    )

    data_hash = Column(
        String(64),
        nullable=False
    )

    previous_hash = Column(
        String(64),
        nullable=False
    )

    current_hash = Column(
        String(64),
        nullable=False,
        unique=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    land_record = relationship(
        "LandRecord"
    )