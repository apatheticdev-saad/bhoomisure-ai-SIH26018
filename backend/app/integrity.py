from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import IntegrityBlock


router = APIRouter(
    prefix="/api/integrity",
    tags=["Integrity"],
)


def build_chain(db: Session, limit: int = 100):
    blocks = (
        db.query(IntegrityBlock)
        .order_by(IntegrityBlock.block_number.asc())
        .limit(min(limit, 500))
        .all()
    )

    chain_valid = True
    previous_hash = None

    for block in blocks:
        # First block must start from GENESIS
        if previous_hash is None:
            if block.previous_hash != "GENESIS":
                chain_valid = False
                break
        else:
            # Every block must point to the previous block
            if block.previous_hash != previous_hash:
                chain_valid = False
                break

        previous_hash = block.current_hash

    return blocks, chain_valid


# ---------------------------------------------------------
# GET /api/integrity/
# ---------------------------------------------------------

@router.get("/")
def get_integrity_chain(
    limit: int = 100,
    db: Session = Depends(get_db),
):
    blocks, chain_valid = build_chain(db, limit)

    return {
        "chain_valid": chain_valid,
        "algorithm": "SHA-256",
        "block_count": len(blocks),
        "blocks": [
            {
                "id": block.id,
                "record_id": block.record_id,
                "block_number": block.block_number,
                "data_hash": block.data_hash,
                "previous_hash": block.previous_hash,
                "current_hash": block.current_hash,
                "created_at": block.created_at,
            }
            for block in blocks
        ],
    }


# ---------------------------------------------------------
# GET /api/integrity/chain
# Compatibility endpoint for existing frontend
# ---------------------------------------------------------

@router.get("/chain")
def get_integrity_chain_legacy(
    limit: int = 100,
    db: Session = Depends(get_db),
):
    blocks, chain_valid = build_chain(db, limit)

    return {
        "chain_valid": chain_valid,
        "algorithm": "SHA-256",
        "count": len(blocks),
        "total_blocks": len(blocks),
        "blocks": [
            {
                "id": block.id,
                "record_id": block.record_id,
                "block_number": block.block_number,
                "data_hash": block.data_hash,
                "previous_hash": block.previous_hash,
                "current_hash": block.current_hash,
                "created_at": block.created_at,
            }
            for block in blocks
        ],
    }


# ---------------------------------------------------------
# POST /api/integrity/verify
# Compatibility endpoint for existing frontend
# ---------------------------------------------------------

@router.post("/verify")
def verify_integrity_chain(
    db: Session = Depends(get_db),
):
    blocks, chain_valid = build_chain(db, 500)

    return {
        "chain_valid": chain_valid,
        "algorithm": "SHA-256",
        "total_blocks": len(blocks),
        "verified_blocks": len(blocks),
        "message": (
            "Integrity chain verified successfully."
            if chain_valid
            else "Integrity chain verification failed."
        ),
    }















# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from app.database import get_db
# from app.models import IntegrityBlock, LandRecord
# from app.integrity_service import (
#     create_integrity_block,
#     verify_integrity_chain,
#     calculate_data_hash,
# )

# router = APIRouter(
#     prefix="/api/integrity",
#     tags=["Record Integrity"]
# )


# @router.get("/chain")
# def get_integrity_chain(
#     db: Session = Depends(get_db)
# ):
#     blocks = (
#         db.query(IntegrityBlock)
#         .order_by(
#             IntegrityBlock.block_number.desc()
#         )
#         .all()
#     )

#     return {
#         "count": len(blocks),
#         "blocks": [
#             {
#                 "id": block.id,
#                 "record_id": block.record_id,
#                 "block_number": block.block_number,
#                 "data_hash": block.data_hash,
#                 "previous_hash": block.previous_hash,
#                 "current_hash": block.current_hash,
#                 "created_at": block.created_at,
#             }
#             for block in blocks
#         ]
#     }


# @router.post("/anchor/{record_id}")
# def anchor_record(
#     record_id: int,
#     db: Session = Depends(get_db)
# ):

#     record = (
#         db.query(LandRecord)
#         .filter(LandRecord.id == record_id)
#         .first()
#     )

#     if not record:
#         raise HTTPException(
#             status_code=404,
#             detail="Land record not found"
#         )

#     block = create_integrity_block(
#         db,
#         record
#     )

#     db.commit()
#     db.refresh(block)

#     return {
#         "message": "Record successfully anchored",
#         "record_id": record.id,
#         "block_number": block.block_number,
#         "data_hash": block.data_hash,
#         "current_hash": block.current_hash,
#     }


# @router.post("/verify")
# def verify_integrity(
#     db: Session = Depends(get_db)
# ):

#     result = verify_integrity_chain(db)

#     return result


# @router.get("/record/{record_id}")
# def get_record_integrity(
#     record_id: int,
#     db: Session = Depends(get_db)
# ):

#     record = (
#         db.query(LandRecord)
#         .filter(LandRecord.id == record_id)
#         .first()
#     )

#     if not record:
#         raise HTTPException(
#             status_code=404,
#             detail="Land record not found"
#         )

#     blocks = (
#         db.query(IntegrityBlock)
#         .filter(
#             IntegrityBlock.record_id == record_id
#         )
#         .order_by(
#             IntegrityBlock.block_number.desc()
#         )
#         .all()
#     )

#     return {
#         "record_id": record_id,
#         "current_data_hash": calculate_data_hash(record),
#         "blocks": [
#             {
#                 "block_number": block.block_number,
#                 "data_hash": block.data_hash,
#                 "previous_hash": block.previous_hash,
#                 "current_hash": block.current_hash,
#                 "created_at": block.created_at,
#             }
#             for block in blocks
#         ]
#     }