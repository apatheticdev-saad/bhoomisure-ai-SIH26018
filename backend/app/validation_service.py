import re


REQUIRED_FIELDS = [
    "owner_name",
    "survey_number",
    "area",
    "village",
    "district",
]


def is_valid_value(value):
    if value is None:
        return False

    value = str(value).strip()

    if not value:
        return False

    # Reject obvious OCR garbage
    invalid_values = {
        ".",
        "-",
        "--",
        "n/a",
        "na",
        "none",
        "null",
        "unknown",
        "code",
        "details",
    }

    if value.lower() in invalid_values:
        return False

    return True


def validate_land_record(data: dict) -> list:
    results = []

    # ---------------------------------------------------------
    # Required fields
    # ---------------------------------------------------------

    for field in REQUIRED_FIELDS:
        value = data.get(field)

        if is_valid_value(value):
            results.append({
                "rule_name": f"required_{field}",
                "status": "passed",
                "severity": "info",
                "message": f"Required field '{field}' is available.",
            })
        else:
            results.append({
                "rule_name": f"required_{field}",
                "status": "failed",
                "severity": "high",
                "message": f"Required field '{field}' is missing.",
            })

    # ---------------------------------------------------------
    # Survey number format
    # ---------------------------------------------------------

    survey_number = data.get("survey_number")

    if is_valid_value(survey_number):

        survey_text = str(survey_number).strip()

        if re.fullmatch(
            r"[A-Za-z0-9]+(?:[./-][A-Za-z0-9]+)*",
            survey_text,
        ):
            results.append({
                "rule_name": "survey_number_format",
                "status": "passed",
                "severity": "info",
                "message": "Survey number format appears valid.",
            })
        else:
            results.append({
                "rule_name": "survey_number_format",
                "status": "failed",
                "severity": "high",
                "message": "Survey number format is invalid.",
            })

    # ---------------------------------------------------------
    # Area validation
    #
    # Supports:
    #   2.45
    #   1
    #   1.20
    #
    # Maharashtra land-record format:
    #   1.20.00
    #
    # Example:
    #   शेतजमिनीचे क्षेत्र: 1.20.00 हे (है.आर.पै)
    # ---------------------------------------------------------

    area = data.get("area")

    if is_valid_value(area):

        area_text = str(area).strip()

        # Normal decimal format
        standard_decimal = re.fullmatch(
            r"\d+(?:\.\d+)?",
            area_text,
        )

        # Maharashtra 7/12 hectare-are-square-metre style
        # Example: 1.20.00
        maharashtra_area = re.fullmatch(
            r"\d+\.\d{1,2}\.\d{1,2}",
            area_text,
        )

        if standard_decimal:

            try:
                numeric_area = float(area_text)

                if numeric_area > 0:
                    results.append({
                        "rule_name": "area_positive",
                        "status": "passed",
                        "severity": "info",
                        "message": "Land area is valid and positive.",
                    })
                else:
                    results.append({
                        "rule_name": "area_positive",
                        "status": "failed",
                        "severity": "high",
                        "message": "Land area must be greater than zero.",
                    })

            except (ValueError, TypeError):
                results.append({
                    "rule_name": "area_positive",
                    "status": "failed",
                    "severity": "high",
                    "message": "Land area is not a valid numeric value.",
                })

        elif maharashtra_area:

            # Maharashtra land records commonly represent
            # area in a multi-part format such as 1.20.00.
            results.append({
                "rule_name": "area_positive",
                "status": "passed",
                "severity": "info",
                "message": "Land area is valid in Maharashtra land-record format.",
            })

        else:

            results.append({
                "rule_name": "area_positive",
                "status": "failed",
                "severity": "high",
                "message": "Land area is not a valid numeric value.",
            })

    # ---------------------------------------------------------
    # Area unit
    # ---------------------------------------------------------

    area_unit = data.get("area_unit")

    allowed_units = {
        "ha",
        "hectare",
        "hectares",
        "acre",
        "acres",
        "sqft",
        "sq ft",
        "sqm",
        "sq m",
    }

    if is_valid_value(area_unit):

        unit_text = str(area_unit).strip().lower()

        if unit_text in allowed_units:
            results.append({
                "rule_name": "area_unit",
                "status": "passed",
                "severity": "info",
                "message": "Area unit is recognized.",
            })
        else:
            results.append({
                "rule_name": "area_unit",
                "status": "warning",
                "severity": "medium",
                "message": "Area unit could not be confidently recognized.",
            })

    # ---------------------------------------------------------
    # Existing-record comparison
    #
    # This is handled separately by reconciliation_service.py.
    # Do NOT create a fake/pending validation result here.
    # ---------------------------------------------------------

    return results


def determine_validation_status(
    validation_results: list,
    overall_confidence: int,
) -> str:

    # AI validation is completed, but a Revenue Officer
    # must still review every processed land record.
    #
    # Therefore:
    #
    # AI validation != human verification
    #
    # Only the verification endpoint can change the record
    # to "verified".

    return "needs_review"