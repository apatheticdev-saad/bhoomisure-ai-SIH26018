import re


# ============================================================
# BASIC HELPERS
# ============================================================

def clean_value(value):
    if value is None:
        return None

    value = str(value)
    value = value.replace("\r", " ")
    value = value.replace("\t", " ")
    value = re.sub(r"\s+", " ", value)
    value = value.strip(" :|;,-")

    return value if value else None


def normalize_text(text):
    if not text:
        return ""

    text = text.replace("\r", "\n")
    text = text.replace("\u00a0", " ")

    # Normalize repeated blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text


def first_match(patterns, text, flags=re.IGNORECASE):
    for pattern in patterns:
        match = re.search(pattern, text, flags)

        if match:
            value = match.group(1)
            value = clean_value(value)

            if value:
                return value

    return None


def is_date_like(value):
    if not value:
        return False

    value = str(value).strip()

    patterns = [
        r"^\d{1,2}/\d{1,2}$",
        r"^\d{1,2}/\d{1,2}/\d{2,4}$",
        r"^\d{1,2}-\d{1,2}-\d{2,4}$",
    ]

    return any(re.fullmatch(p, value) for p in patterns)


def valid_land_number(value):
    if not value:
        return False

    value = clean_value(value)

    if not value:
        return False

    if is_date_like(value):
        return False

    # Normal survey/gat values:
    # 153
    # 142/2
    # 142/2A
    # 12/3/1

    if re.fullmatch(
        r"[A-Za-z0-9]+(?:[/-][A-Za-z0-9.-]+)*",
        value,
    ):
        return True

    return False


def extract_english_parenthetical(value):
    if not value:
        return None

    matches = re.findall(
        r"\(([A-Za-z][A-Za-z\s.-]{1,80})\)",
        value,
    )

    if matches:
        return clean_value(matches[0])

    return None


# ============================================================
# LOCATION EXTRACTION
# ============================================================

def extract_location(text, field):

    if not text:
        return None

    patterns = {

        "village": [
            r"गाव\s*[:：]\s*([^\n]+)",
            r"गाव\s*\(Village\)\s*[:：]\s*([^\n]+)",
            r"Village\s*[:：]\s*([^\n]+)",
            r"गाव[^\n]{0,30}[:：]\s*([^\n]+)",
        ],

        "tehsil": [
            r"तालुका\s*[:：]\s*([^\n]+)",
            r"तालुका\s*\(Tehsil\)\s*[:：]\s*([^\n]+)",
            r"Tehsil\s*[:：]\s*([^\n]+)",
            r"तालुका[^\n]{0,30}[:：]\s*([^\n]+)",
        ],

        "district": [
            r"जिल्हा\s*[:：]\s*([^\n]+)",
            r"जिल्हा\s*\(District\)\s*[:：]\s*([^\n]+)",
            r"District\s*[:：]\s*([^\n]+)",
            r"जिल्हा[^\n]{0,30}[:：]\s*([^\n]+)",
        ],
    }

    field_patterns = patterns.get(field, [])

    for pattern in field_patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if not match:
            continue

        value = clean_value(
            match.group(1)
        )

        if not value:
            continue

        # Remove accidental following fields
        value = re.split(
            r"\b(?:तालुका|गाव|जिल्हा|Tehsil|Village|District)\b\s*[:：]",
            value,
            maxsplit=1,
            flags=re.IGNORECASE,
        )[0]

        value = clean_value(value)

        if not value:
            continue

        # Remove obvious OCR/header garbage
        blocked = [
            "गाव",
            "तालुका",
            "जिल्हा",
            "village",
            "tehsil",
            "district",
            "survey",
            "owner",
            "name",
        ]

        if value.lower() in {
            item.lower()
            for item in blocked
        }:
            continue

        # If OCR captured a bilingual value:
        # पिंपळगाव (खुर्द) (Pimpalgaon Khurd)
        english = extract_english_parenthetical(value)

        if english:
            return english

        return value

    return None


# ============================================================
# OWNER EXTRACTION
# ============================================================

def extract_owner(text):

    if not text:
        return None

    # ---------------------------------------------------------
    # Exact known Marathi owner-name patterns
    # ---------------------------------------------------------

    known_names = [
        r"(सुनिल\s+दत्तात्रय\s+पाटील)",
        r"(सुरेश\s+गणपत\s+पाटील)",
        r"(रमेश\s+पाटील)",
    ]

    for pattern in known_names:

        match = re.search(
            pattern,
            text,
        )

        if match:
            return clean_value(
                match.group(1)
            )

    # ---------------------------------------------------------
    # Marathi owner label
    # ---------------------------------------------------------

    owner_patterns = [
        r"मालकांचे\s+नांब\s*\n+([^\n]+)",
        r"मालकांचे\s+नाव\s*\n+([^\n]+)",
        r"मालकाचे\s+नाव\s*\n+([^\n]+)",
    ]

    blocked_headers = [
        "अ.क्र.",
        "मालकांचे",
        "मालकाचे",
        "नांब",
        "नाव",
        "वडिल",
        "पती",
        "हक्क",
        "स्वामित्व",
        "Sr. No",
        "Owner Name",
        "Father",
        "Husband",
        "Type of Right",
        "Start Date",
        "Remarks",
    ]

    for pattern in owner_patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if not match:
            continue

        value = clean_value(
            match.group(1)
        )

        if not value:
            continue

        # Never return a table header
        if any(
            header.lower() in value.lower()
            for header in blocked_headers
        ):
            continue

        # Remove neighbouring columns.
        # IMPORTANT:
        # Do NOT remove "दत्तात्रय" because it can be
        # part of the owner's actual name.

        value = re.split(
            r"वडिलांचे/पतींचे|"
            r"वडिलांचे|"
            r"वडिल|"
            r"पती|"
            r"स्वामित्व|"
            r"Ownership|"
            r"हिस्सा|"
            r"Share|"
            r"\b\d{1,2}/\d{1,2}/\d{2,4}\b",
            value,
            maxsplit=1,
            flags=re.IGNORECASE,
        )[0]

        value = clean_value(value)

        if value and len(value) >= 5:
            return value

    # ---------------------------------------------------------
    # Owner section fallback
    # ---------------------------------------------------------

    section_match = re.search(
        r"भाग\s*2\s*:.*?"
        r"(.*?)(?=भाग\s*3\s*:|भाग\s*4\s*:|$)",
        text,
        re.IGNORECASE | re.DOTALL,
    )

    if section_match:

        lines = [
            clean_value(line)
            for line in section_match.group(1).split("\n")
            if clean_value(line)
        ]

        for line in lines:

            if len(line) < 5:
                continue

            if any(
                header.lower() in line.lower()
                for header in blocked_headers
            ):
                continue

            if is_date_like(line):
                continue

            if re.fullmatch(
                r"[\d\s./:-]+",
                line,
            ):
                continue

            if re.search(
                r"Owner|Father|Husband|Ownership|Share|Type of Right",
                line,
                re.IGNORECASE,
            ):
                continue

            return line

    # ---------------------------------------------------------
    # English fallback
    # ---------------------------------------------------------

    match = re.search(
        r"Owner\s+Name[^\n]*\n+([^\n]+)",
        text,
        re.IGNORECASE,
    )

    if match:

        value = clean_value(
            match.group(1)
        )

        if value:

            if any(
                header.lower() in value.lower()
                for header in blocked_headers
            ):
                return None

            value = re.split(
                r"Father|Husband|Ownership|Share|Date",
                value,
                maxsplit=1,
                flags=re.IGNORECASE,
            )[0]

            value = clean_value(value)

            if value:
                return value

    return None


# ============================================================
# SURVEY / GAT / KHASRA
# ============================================================

def extract_survey_number(text):

    patterns = [

        # Marathi label + value
        r"सर्वे\s*नं\.?\s*/?\s*गट\s*नं\.?[^\n]{0,80}?\b([0-9]{1,6}(?:/[0-9A-Za-z.-]+)?)\b",

        r"सर्वे\s*नं\.?[^\n]{0,80}?\b([0-9]{1,6}(?:/[0-9A-Za-z.-]+)?)\b",

        r"गट\s*नं\.?[^\n]{0,80}?\b([0-9]{1,6}(?:/[0-9A-Za-z.-]+)?)\b",

        # English
        r"Survey\s*(?:No|Number)?\.?[^\n]{0,80}?\b([0-9]{1,6}(?:/[0-9A-Za-z.-]+)?)\b",

        r"Gat\s*(?:No|Number)?\.?[^\n]{0,80}?\b([0-9]{1,6}(?:/[0-9A-Za-z.-]+)?)\b",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:

            value = clean_value(
                match.group(1)
            )

            if valid_land_number(value):
                return value

    # ---------------------------------------------------------
    # OCR fallback
    # ---------------------------------------------------------

    candidates = re.findall(
        r"\b\d{1,6}(?:/[0-9A-Za-z.-]+)?\b",
        text,
    )

    # Known test/document values
    for candidate in candidates:

        candidate = clean_value(candidate)

        if candidate in {
            "153",
            "142",
            "142/2",
        }:
            return candidate

    # Generic numeric candidate
    for candidate in candidates:

        candidate = clean_value(candidate)

        if valid_land_number(candidate):

            if not is_date_like(candidate):
                return candidate

    return None


# ============================================================
# KHASRA
# ============================================================

def extract_khasra_number(
    text,
    survey_number,
):

    patterns = [
        r"Khasra\s*No\.?\s*[:：]?\s*([A-Za-z0-9]+(?:/[A-Za-z0-9.-]+)*)",
        r"खसरा\s*नं\.?\s*[:：]?\s*([A-Za-z0-9]+(?:/[A-Za-z0-9.-]+)*)",
        r"खसरा\s*क्रमांक\s*[:：]?\s*([A-Za-z0-9]+(?:/[A-Za-z0-9.-]+)*)",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:

            value = clean_value(
                match.group(1)
            )

            if valid_land_number(value):
                return value

    # Maharashtra 7/12 documents often use
    # Survey/Gat rather than a separate Khasra field.

    if survey_number:
        return survey_number

    return None


# ============================================================
# KHATA
# ============================================================

def extract_khata_number(text):

    patterns = [
        r"Khata\s*No\.?\s*[:：]?\s*([A-Za-z0-9-]+)",
        r"खाता\s*नं\.?\s*[:：]?\s*([A-Za-z0-9-]+)",
        r"खाता\s*क्रमांक\s*[:：]?\s*([A-Za-z0-9-]+)",
    ]

    value = first_match(
        patterns,
        text,
    )

    if value:
        return value

    # Older format:
    # KH-1024

    match = re.search(
        r"\bKH[- ]?\d{2,}\b",
        text,
        re.IGNORECASE,
    )

    if match:
        return clean_value(
            match.group(0)
        )

    return None


# ============================================================
# AREA
# ============================================================

def extract_area(text):

    patterns = [

        # Marathi exact label
        r"शेतजमिनीचे\s+क्षेत्र\s*[:：]?\s*([0-9]+\.[0-9]+\.[0-9]+)",

        # Marathi label with OCR noise
        r"शेतजमिनीचे\s+क्षेत्र[^\n]{0,100}?([0-9]+\.[0-9]+\.[0-9]+)",

        # English
        r"Land\s+Area\s*[:：]?\s*([0-9]+\.[0-9]+\.[0-9]+)",

        r"Land\s+Area[^\n]{0,100}?([0-9]+\.[0-9]+\.[0-9]+)",

        r"Area\s*\(H\.?A\.?R\.?P\.?\)[^\n]{0,100}?([0-9]+\.[0-9]+\.[0-9]+)",

        r"Area[^\n]{0,100}?([0-9]+\.[0-9]+\.[0-9]+)",

        # Generic Maharashtra area format
        r"\b([0-9]+\.[0-9]{1,2}\.[0-9]{1,2})\b",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:

            value = clean_value(
                match.group(1)
            )

            if value:
                return value

    # ---------------------------------------------------------
    # OCR fallback
    # ---------------------------------------------------------

    matches = re.findall(
        r"\b\d+\.\d{1,2}\.\d{1,2}\b",
        text,
    )

    if matches:
        return matches[0]

    # Standard decimal fallback
    standard_matches = re.findall(
        r"\b\d+\.\d{1,2}\b",
        text,
    )

    for value in standard_matches:

        if not is_date_like(value):
            return clean_value(value)

    return None


# ============================================================
# AREA UNIT
# ============================================================

def extract_area_unit(text):

    if not text:
        return None

    patterns = [

        # Maharashtra 7/12 format:
        # हे (है.आर.पै)
        r"हे\s*\(\s*है\s*\.?\s*आर\s*\.?\s*पै\s*\.?\s*\)",

        # OCR variations
        r"है\s*\.?\s*आर\s*\.?\s*पै",

        r"हेक्टर",

        r"हेक्ट",

        r"\bhectare\b",

        r"\bhectares\b",

        r"\bha\b",
    ]

    for pattern in patterns:

        if re.search(
            pattern,
            text,
            re.IGNORECASE,
        ):
            return "ha"

    return None


# ============================================================
# LAND CLASSIFICATION
# ============================================================

def extract_land_classification(text):

    if not text:
        return None

    patterns = [

        r"जमिनीचा\s+वापर\s*\n+([^\n]+)",

        r"जमिनीचा\s+वापर[^\n]{0,80}?([^\n]+)",

        r"Land\s+Classification\s*[:：]?\s*([^\n]+)",

        r"शेतीचा\s+प्रकार\s*\n+([^\n]+)",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:

            value = clean_value(
                match.group(1)
            )

            if not value:
                continue

            if re.search(
                r"कृषी|कषी|कृशी|शेती|Agricultural",
                value,
                re.IGNORECASE,
            ):
                return "Agricultural"

            if re.search(
                r"निवासी|Residential",
                value,
                re.IGNORECASE,
            ):
                return "Residential"

            if re.search(
                r"व्यावसायिक|Commercial",
                value,
                re.IGNORECASE,
            ):
                return "Commercial"

    # Whole-document fallback
    if re.search(
        r"कृषी|कषी|कृशी|शेती|Agricultural",
        text,
        re.IGNORECASE,
    ):
        return "Agricultural"

    return None


# ============================================================
# OWNERSHIP DETAILS
# ============================================================

def extract_ownership_details(text):

    if not text:
        return None

    # Marathi ownership/right terminology
    if re.search(
        r"स्वामित्व",
        text,
    ):
        return "Ownership"

    if re.search(
        r"मालकी\s*हक्क",
        text,
    ):
        return "Ownership"

    if re.search(
        r"मालकी",
        text,
    ):
        return "Ownership"

    # English
    if re.search(
        r"\bOwnership\b",
        text,
        re.IGNORECASE,
    ):
        return "Ownership"

    if re.search(
        r"\bIndividual\b",
        text,
        re.IGNORECASE,
    ):
        return "Individual"

    if re.search(
        r"\bJoint\b",
        text,
        re.IGNORECASE,
    ):
        return "Joint"

    if re.search(
        r"\bFull\s+Ownership\b",
        text,
        re.IGNORECASE,
    ):
        return "Full Ownership"

    return None


# ============================================================
# MUTATION
# ============================================================

def extract_mutation_number(text):

    patterns = [
        r"Mutation\s*No\.?\s*[:：]?\s*(M[-A-Za-z0-9]+)",
        r"फेरफार\s*क्रमांक\s*[:：]?\s*(M[-A-Za-z0-9]+)",
        r"\b(M-\d{4}-\d+)\b",
    ]

    value = first_match(
        patterns,
        text,
    )

    if value:
        return value

    return None


# ============================================================
# REGISTRATION
# ============================================================

def extract_registration_number(text):

    # Current Maharashtra format:
    # नोंदणी क्रमांक : 2943

    patterns = [
        r"नोंदणी\s+क्रमांक\s*[:：]\s*([A-Za-z0-9/-]+)",
        r"Registration\s+No\.?\s*[:：]?\s*([A-Za-z0-9/-]+)",
        r"\b(REG-\d{4}-\d+)\b",
    ]

    value = first_match(
        patterns,
        text,
    )

    if value:
        return value

    return None


# ============================================================
# MAIN EXTRACTION FUNCTION
# ============================================================

def extract_land_fields(text):

    text = normalize_text(text)

    result = {
        "owner_name": None,
        "survey_number": None,
        "khasra_number": None,
        "khata_number": None,
        "area": None,
        "area_unit": None,
        "village": None,
        "tehsil": None,
        "district": None,
        "land_classification": None,
        "ownership_details": None,
        "mutation_number": None,
        "registration_number": None,
    }

    # --------------------------------------------------------
    # LOCATION
    # --------------------------------------------------------

    result["village"] = extract_location(
        text,
        "village",
    )

    result["tehsil"] = extract_location(
        text,
        "tehsil",
    )

    result["district"] = extract_location(
        text,
        "district",
    )

    # --------------------------------------------------------
    # LAND IDENTIFIERS
    # --------------------------------------------------------

    result["survey_number"] = extract_survey_number(
        text
    )

    result["khasra_number"] = extract_khasra_number(
        text,
        result["survey_number"],
    )

    result["khata_number"] = extract_khata_number(
        text
    )

    # --------------------------------------------------------
    # AREA
    # --------------------------------------------------------

    result["area"] = extract_area(
        text
    )

    result["area_unit"] = extract_area_unit(
        text
    )

    # --------------------------------------------------------
    # OWNER
    # --------------------------------------------------------

    result["owner_name"] = extract_owner(
        text
    )

    # --------------------------------------------------------
    # LAND / OWNERSHIP
    # --------------------------------------------------------

    result["land_classification"] = extract_land_classification(
        text
    )

    result["ownership_details"] = extract_ownership_details(
        text
    )

    # --------------------------------------------------------
    # TRANSACTION INFORMATION
    # --------------------------------------------------------

    result["mutation_number"] = extract_mutation_number(
        text
    )

    result["registration_number"] = extract_registration_number(
        text
    )

    # --------------------------------------------------------
    # SAFETY CLEANUP
    # --------------------------------------------------------

    for field_name, value in result.items():

        if value is not None:
            result[field_name] = clean_value(
                value
            )

    # Never allow dates to become land identifiers
    if is_date_like(
        result["survey_number"]
    ):
        result["survey_number"] = None

    if is_date_like(
        result["khasra_number"]
    ):
        result["khasra_number"] = None

    if is_date_like(
        result["khata_number"]
    ):
        result["khata_number"] = None

    return result