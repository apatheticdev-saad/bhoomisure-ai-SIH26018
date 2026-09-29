import hashlib
import json

from app.models import LandRecord, IntegrityBlock


# =========================================================
# FIELDS USED FOR RECORD INTEGRITY
# =========================================================

LAND_RECORD_FIELDS = [
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
    "overall_confidence",
    "validation_status",
]


# =========================================================
# GET CANONICAL RECORD DATA
# =========================================================

def get_record_data(record: LandRecord):
    return {
        field: getattr(record, field)
        for field in LAND_RECORD_FIELDS
    }


# =========================================================
# CALCULATE SHA-256 DATA HASH
# =========================================================

def calculate_data_hash(record: LandRecord) -> str:
    """
    Creates a deterministic SHA-256 fingerprint
    from the important land-record fields.
    """

    data = get_record_data(record)

    canonical_data = json.dumps(
        data,
        sort_keys=True,
        ensure_ascii=False,
        separators=(",", ":")
    )

    return hashlib.sha256(
        canonical_data.encode("utf-8")
    ).hexdigest()


# =========================================================
# CALCULATE BLOCK HASH
# =========================================================

def calculate_block_hash(
    block_number: int,
    record_id: int,
    data_hash: str,
    previous_hash: str,
) -> str:

    payload = (
        f"{block_number}|"
        f"{record_id}|"
        f"{data_hash}|"
        f"{previous_hash}"
    )

    return hashlib.sha256(
        payload.encode("utf-8")
    ).hexdigest()


# =========================================================
# CREATE INTEGRITY BLOCK
# =========================================================

def create_integrity_block(
    db,
    record: LandRecord
):
    """
    Creates a new tamper-evident integrity block
    for the current state of a land record.
    """

    # Calculate fingerprint of current record
    data_hash = calculate_data_hash(record)

    # Find the latest block in the entire chain
    previous_block = (
        db.query(IntegrityBlock)
        .order_by(
            IntegrityBlock.block_number.desc()
        )
        .first()
    )

    if previous_block:

        previous_hash = previous_block.current_hash

        block_number = (
            previous_block.block_number + 1
        )

    else:

        previous_hash = "GENESIS"

        block_number = 1

    # -----------------------------------------------------
    # Avoid duplicate block for unchanged record
    # -----------------------------------------------------

    latest_record_block = (
        db.query(IntegrityBlock)
        .filter(
            IntegrityBlock.record_id == record.id
        )
        .order_by(
            IntegrityBlock.block_number.desc()
        )
        .first()
    )

    if (
        latest_record_block
        and latest_record_block.data_hash == data_hash
    ):
        return latest_record_block

    # -----------------------------------------------------
    # Create current block hash
    # -----------------------------------------------------

    current_hash = calculate_block_hash(
        block_number=block_number,
        record_id=record.id,
        data_hash=data_hash,
        previous_hash=previous_hash,
    )

    block = IntegrityBlock(
        record_id=record.id,
        block_number=block_number,
        data_hash=data_hash,
        previous_hash=previous_hash,
        current_hash=current_hash,
    )

    db.add(block)

    # Make block available before final commit
    db.flush()

    return block


# =========================================================
# VERIFY ENTIRE INTEGRITY CHAIN
# =========================================================

def verify_integrity_chain(db):

    blocks = (
        db.query(IntegrityBlock)
        .order_by(
            IntegrityBlock.block_number.asc()
        )
        .all()
    )

    results = []

    expected_previous_hash = "GENESIS"

    chain_valid = True

    # =====================================================
    # VERIFY BLOCK-TO-BLOCK CHAIN
    # =====================================================

    for block in blocks:

        calculated_hash = calculate_block_hash(
            block_number=block.block_number,
            record_id=block.record_id,
            data_hash=block.data_hash,
            previous_hash=block.previous_hash,
        )

        block_hash_valid = (
            calculated_hash == block.current_hash
        )

        previous_hash_valid = (
            block.previous_hash
            == expected_previous_hash
        )

        valid = (
            block_hash_valid
            and previous_hash_valid
        )

        if not valid:
            chain_valid = False

        results.append({
            "block_number": block.block_number,
            "record_id": block.record_id,
            "valid": valid,
            "hash_valid": block_hash_valid,
            "previous_link_valid": previous_hash_valid,
            "current_hash": block.current_hash,
        })

        expected_previous_hash = block.current_hash

    # =====================================================
    # VERIFY CURRENT RECORD AGAINST LATEST BLOCK
    # =====================================================

    record_checks = []

    record_ids = list({
        block.record_id
        for block in blocks
    })

    for record_id in record_ids:

        latest_block = (
            db.query(IntegrityBlock)
            .filter(
                IntegrityBlock.record_id == record_id
            )
            .order_by(
                IntegrityBlock.block_number.desc()
            )
            .first()
        )

        record = (
            db.query(LandRecord)
            .filter(
                LandRecord.id == record_id
            )
            .first()
        )

        if not record:

            record_checks.append({
                "record_id": record_id,
                "valid": False,
                "reason": "Land record not found",
            })

            chain_valid = False

            continue

        current_data_hash = (
            calculate_data_hash(record)
        )

        data_match = (
            current_data_hash
            == latest_block.data_hash
        )

        if not data_match:
            chain_valid = False

        record_checks.append({
            "record_id": record_id,
            "valid": data_match,
            "stored_hash": latest_block.data_hash,
            "current_hash": current_data_hash,
        })

    return {
        "chain_valid": chain_valid,
        "total_blocks": len(blocks),
        "blocks": results,
        "record_checks": record_checks,
    }