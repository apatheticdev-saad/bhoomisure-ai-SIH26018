# backend/app/confidence_service.py


# Core fields are more important for land-record extraction.
CORE_FIELDS = {
    "owner_name": 1.5,
    "survey_number": 1.5,
    "area": 1.5,
    "village": 1.2,
    "tehsil": 1.0,
    "district": 1.2,
    "land_classification": 0.8,
    "area_unit": 0.8,
}

# Supporting fields are useful but may legitimately be absent
# from some document types.
OPTIONAL_FIELDS = {
    "khasra_number": 0.5,
    "khata_number": 0.5,
    "ownership_details": 0.5,
    "mutation_number": 0.3,
    "registration_number": 0.3,
}


def calculate_field_confidence(value):
    """
    Basic field-level confidence.

    This represents whether the AI successfully extracted
    a meaningful value. Validation is handled separately.
    """

    if value is None:
        return 0

    value = str(value).strip()

    if not value:
        return 0

    # Reject obvious OCR garbage.
    garbage_values = {
        "s",
        "S",
        "ee",
        "cee",
        ".",
        "-",
        "--",
        "n/a",
        "na",
        "none",
        "null",
        "unknown",
    }

    if value in garbage_values:
        return 0

    # Longer meaningful values get normal extraction confidence.
    if len(value) >= 2:
        return 75

    return 40


def calculate_overall_confidence(extracted_data: dict) -> int:
    """
    Calculate confidence using weighted document fields.

    Important:
    - Missing optional fields do not heavily penalize the score.
    - Core fields have higher importance.
    - Validation status is intentionally separate.
    """

    if not extracted_data:
        return 0

    weighted_score = 0
    total_weight = 0

    # ---------------------------------------------------------
    # Core fields
    # ---------------------------------------------------------

    for field_name, weight in CORE_FIELDS.items():

        value = extracted_data.get(field_name)

        score = calculate_field_confidence(value)

        weighted_score += score * weight
        total_weight += weight

    # ---------------------------------------------------------
    # Optional/supporting fields
    # ---------------------------------------------------------

    for field_name, weight in OPTIONAL_FIELDS.items():

        value = extracted_data.get(field_name)

        # Missing optional fields should not reduce confidence
        # as aggressively as missing core fields.
        if value is None or not str(value).strip():
            continue

        score = calculate_field_confidence(value)

        weighted_score += score * weight
        total_weight += weight

    if total_weight == 0:
        return 0

    confidence = round(weighted_score / total_weight)

    return max(0, min(confidence, 95))