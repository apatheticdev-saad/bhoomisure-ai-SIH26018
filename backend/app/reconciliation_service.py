# backend/app/reconciliation_service.py
from sqlalchemy.orm import Session
from app.models import LandRecord


def normalize_value(value):
    if value is None:
        return ""

    return " ".join(
        str(value).strip().lower().split()
    )


def numbers_are_equal(value1, value2):
    try:
        number1 = float(value1)
        number2 = float(value2)

        return abs(number1 - number2) < 0.0001

    except (ValueError, TypeError):
        return normalize_value(value1) == normalize_value(value2)


def find_matching_records(
    db: Session,
    data: dict,
    exclude_record_id: int | None = None,
):
    survey_number = normalize_value(
        data.get("survey_number")
    )

    village = normalize_value(
        data.get("village")
    )

    district = normalize_value(
        data.get("district")
    )

    if not survey_number:
        return []

    query = db.query(LandRecord)

    if exclude_record_id is not None:
        query = query.filter(
            LandRecord.id != exclude_record_id
        )

    records = query.all()

    matches = []

    for record in records:

        record_survey = normalize_value(
            record.survey_number
        )

        record_village = normalize_value(
            record.village
        )

        record_district = normalize_value(
            record.district
        )

        if record_survey != survey_number:
            continue

        if village and record_village != village:
            continue

        if district and record_district != district:
            continue

        matches.append(record)

    return matches


def compare_with_existing_record(
    existing_record: LandRecord,
    new_data: dict,
):
    comparisons = []

    fields_to_compare = [
        "owner_name",
        "area",
        "area_unit",
        "khata_number",
        "khasra_number",
        "tehsil",
        "land_classification",
        "ownership_details",
    ]

    for field in fields_to_compare:

        existing_value = getattr(
            existing_record,
            field,
            None,
        )

        new_value = new_data.get(field)

        if existing_value in [None, ""] or new_value in [None, ""]:
            continue

        if field == "area":

            same = numbers_are_equal(
                existing_value,
                new_value,
            )

        else:

            same = (
                normalize_value(existing_value)
                == normalize_value(new_value)
            )

        if same:

            comparisons.append({
    "field": field,
    "status": "matched",
    "severity": "info",
    "existing_value": existing_value,
    "new_value": new_value,
    "existing_record_id": existing_record.id,
    "existing_record_status": existing_record.validation_status,
    "message": f"{field} matches the existing record.",
})

        else:

            severity = "high"

            if field in {
                "tehsil",
                "land_classification",
                "ownership_details",
            }:
                severity = "medium"

            comparisons.append({
    "field": field,
    "status": "mismatch",
    "severity": severity,
    "existing_value": existing_value,
    "new_value": new_value,
    "existing_record_id": existing_record.id,
    "existing_record_status": existing_record.validation_status,
    "message": f"{field} does not match the existing record.",
})

    return comparisons


def reconcile_land_record(
    db: Session,
    new_data: dict,
    exclude_record_id: int | None = None,
):
    matching_records = find_matching_records(
        db=db,
        data=new_data,
        exclude_record_id=exclude_record_id,
    )

    if not matching_records:

        return {
            "status": "no_match",
            "matching_record_count": 0,
            "matching_record_ids": [],
            "duplicate_record_ids": [],
            "conflict_record_ids": [],
            "record_classifications": [],
            "comparisons": [],
            "mismatches": [],
            "message": (
                "No existing record was found for "
                "the same survey number, village and district."
            ),
        }

    all_comparisons = []
    mismatches = []

    duplicate_record_ids = []
    conflict_record_ids = []
    record_classifications = []

    for existing_record in matching_records:

        comparisons = compare_with_existing_record(
            existing_record=existing_record,
            new_data=new_data,
        )

        record_mismatches = [
        comparison
        for comparison in comparisons
        if comparison["status"] == "mismatch"
]

        if record_mismatches:

            classification = "conflict"

            conflict_record_ids.append(
                existing_record.id
            )

        else:

            classification = "duplicate"

            duplicate_record_ids.append(
                existing_record.id
            )

        record_classifications.append({
            "record_id": existing_record.id,
            "classification": classification,
            "comparison_count": len(comparisons),
            "mismatch_count": len(record_mismatches),
        })

        for comparison in comparisons:

            comparison["existing_record_id"] = (
                existing_record.id
            )

            comparison["record_classification"] = (
                classification
            )

            all_comparisons.append(comparison)

            if comparison["status"] == "mismatch":
                mismatches.append(comparison)

    if mismatches:

        status = "conflict"

        message = (
            "Existing records were found, but one or "
            "more important fields do not match."
        )

    else:

        status = "matched"

        message = (
            "Existing record(s) were found and the "
            "compared fields match."
        )

    return {
        "status": status,
        "matching_record_count": len(matching_records),
        "matching_record_ids": [
            record.id
            for record in matching_records
        ],
        "duplicate_record_ids": duplicate_record_ids,
        "conflict_record_ids": conflict_record_ids,
        "record_classifications": record_classifications,
        "comparisons": all_comparisons,
        "mismatches": mismatches,
        "message": message,
    }