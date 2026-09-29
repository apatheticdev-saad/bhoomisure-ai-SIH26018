from pathlib import Path
import re
import os

import cv2
import numpy as np
import pytesseract


# =========================================================
# TESSERACT CONFIGURATION
# =========================================================

pytesseract.pytesseract.tesseract_cmd = os.getenv(
    "TESSERACT_CMD",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# =========================================================
# OCR TEXT CLEANING
# =========================================================

def clean_ocr_text(text: str) -> str:
    if not text:
        return ""

    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove excessive spaces/tabs
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    return text.strip()


# =========================================================
# IMAGE PREPROCESSING
# =========================================================

def preprocess_image(file_path: str):
    """
    Creates multiple OCR-friendly versions of the image.

    The goal is to handle:
    - scanned documents
    - low contrast
    - noisy documents
    - small text
    - uneven backgrounds
    """

    image = cv2.imread(file_path)

    if image is None:
        raise ValueError(f"Unable to read image: {file_path}")

    # -----------------------------------------------------
    # Upscale image
    # -----------------------------------------------------

    height, width = image.shape[:2]

    scale = 2

    if width < 1800 or height < 1800:
        image = cv2.resize(
            image,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_CUBIC,
        )

    # -----------------------------------------------------
    # Grayscale
    # -----------------------------------------------------

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # -----------------------------------------------------
    # Contrast enhancement
    # -----------------------------------------------------

    clahe = cv2.createCLAHE(
        clipLimit=2.5,
        tileGridSize=(8, 8)
    )

    enhanced = clahe.apply(gray)

    # -----------------------------------------------------
    # Denoising
    # -----------------------------------------------------

    denoised = cv2.fastNlMeansDenoising(
        enhanced,
        None,
        10,
        7,
        21
    )

    # -----------------------------------------------------
    # Adaptive threshold
    # -----------------------------------------------------

    adaptive = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11
    )

    # -----------------------------------------------------
    # Otsu threshold
    # -----------------------------------------------------

    _, otsu = cv2.threshold(
        denoised,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    # -----------------------------------------------------
    # Slight sharpening
    # -----------------------------------------------------

    kernel = np.array([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ])

    sharpened = cv2.filter2D(
        denoised,
        -1,
        kernel
    )

    return [
        image,
        gray,
        enhanced,
        denoised,
        adaptive,
        otsu,
        sharpened,
    ]


# =========================================================
# OCR SCORING
# =========================================================

def score_ocr_result(text: str) -> int:
    """
    Score OCR output based on useful land-record signals,
    not simply text length.
    """

    if not text:
        return 0

    score = 0

    lower = text.lower()

    # -----------------------------------------------------
    # English land-record keywords
    # -----------------------------------------------------

    keywords = [
        "owner",
        "name",
        "survey",
        "gat",
        "khasra",
        "khata",
        "area",
        "village",
        "gaon",
        "tehsil",
        "taluka",
        "district",
        "zilla",
        "classification",
        "ownership",
        "mutation",
        "ferfar",
        "registration",
    ]

    for keyword in keywords:
        if keyword in lower:
            score += 30

    # -----------------------------------------------------
    # Marathi keywords
    # -----------------------------------------------------

    marathi_keywords = [
        "नाव",
        "गट",
        "सर्वे",
        "सर्वे नं",
        "खसरा",
        "खाता",
        "क्षेत्र",
        "गाव",
        "तालुका",
        "जिल्हा",
        "फेरफार",
        "मालक",
    ]

    for keyword in marathi_keywords:
        if keyword in text:
            score += 40

    # -----------------------------------------------------
    # Numbers are useful in land records
    # -----------------------------------------------------

    numbers = re.findall(
        r"\d+(?:[./-]\d+)*",
        text
    )

    score += min(len(numbers) * 3, 60)

    # -----------------------------------------------------
    # Useful lines
    # -----------------------------------------------------

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    score += min(len(lines) * 2, 40)

    # -----------------------------------------------------
    # Penalize extremely noisy output
    # -----------------------------------------------------

    if len(text) > 30:

        alphanumeric = sum(
            char.isalnum()
            for char in text
        )

        ratio = alphanumeric / len(text)

        if ratio < 0.25:
            score -= 30

    return max(score, 0)


# =========================================================
# OCR FOR IMAGES
# =========================================================

def extract_text_from_image(file_path: str) -> str:

    images = preprocess_image(file_path)

    results = []

    # PSM 6 = structured block
    # PSM 11 = sparse text
    # PSM 12 = sparse text with better mixed layouts

    configs = [
        "--oem 3 --psm 6",
        "--oem 3 --psm 11",
        "--oem 3 --psm 12",
    ]

    for image in images:

        for config in configs:

            try:

                text = pytesseract.image_to_string(
                    image,
                    lang="eng+mar",
                    config=config
                )

                text = clean_ocr_text(text)

                if text:
                    score = score_ocr_result(text)

                    results.append(
                        {
                            "text": text,
                            "score": score,
                        }
                    )

            except Exception:
                continue

    if not results:
        return ""

    # Select the OCR result with the strongest
    # land-record signal.
    best_result = max(
        results,
        key=lambda item: item["score"]
    )

    return best_result["text"]


# =========================================================
# OCR FOR PDF
# =========================================================

def extract_text_from_pdf(file_path: str) -> str:

    try:

        from pypdf import PdfReader

        reader = PdfReader(file_path)

        text_parts = []

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text_parts.append(page_text)

        return clean_ocr_text(
            "\n".join(text_parts)
        )

    except Exception as exc:

        return f"PDF processing error: {exc}"


# =========================================================
# MAIN OCR FUNCTION
# =========================================================

def extract_text(file_path: str) -> str:

    path = Path(file_path)

    extension = path.suffix.lower()

    if extension in {
        ".jpg",
        ".jpeg",
        ".png",
    }:

        return extract_text_from_image(
            str(path)
        )

    if extension == ".pdf":

        return extract_text_from_pdf(
            str(path)
        )

    return ""