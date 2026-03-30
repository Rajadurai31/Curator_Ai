import logging
import pdfplumber
from docx import Document          # python-docx imports as 'docx'
from io import BytesIO

log = logging.getLogger("curator.resume_parser")

MAX_FILE_MB = 10
MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024


def parse_resume(file_bytes: bytes, filename: str) -> str:
    """
    Convert PDF or DOCX bytes → plain text string.
    Raises ValueError with a user-friendly message on failure.
    """
    if len(file_bytes) > MAX_FILE_BYTES:
        raise ValueError(f"File too large (max {MAX_FILE_MB} MB).")

    name = filename.lower().strip()
    log.info("parse_resume: file=%s  size=%d bytes", filename, len(file_bytes))

    # ── PDF ──────────────────────────────────────────────────────────────────
    if name.endswith(".pdf"):
        try:
            with pdfplumber.open(BytesIO(file_bytes)) as pdf:
                log.info("parse_resume: PDF has %d pages", len(pdf.pages))
                pages = []
                for i, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    if text:
                        pages.append(text)
                    else:
                        log.warning("parse_resume: page %d returned no text", i + 1)
        except Exception as e:
            raise ValueError(f"Could not open PDF: {e}")

        text = "\n".join(pages).strip()
        if not text:
            raise ValueError(
                "No text found in PDF. "
                "Make sure it is a text-based PDF (not a scanned image). "
                "Try copy-pasting text from the PDF to verify."
            )
        log.info("parse_resume: extracted %d chars from PDF", len(text))
        return text

    # ── DOCX ─────────────────────────────────────────────────────────────────
    if name.endswith(".docx"):
        try:
            doc = Document(BytesIO(file_bytes))
        except Exception as e:
            raise ValueError(f"Could not open DOCX: {e}")

        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        # Also grab text from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        paragraphs.append(cell.text.strip())

        text = "\n".join(paragraphs).strip()
        if not text:
            raise ValueError("No text found in DOCX file.")
        log.info("parse_resume: extracted %d chars from DOCX", len(text))
        return text

    raise ValueError(
        f"Unsupported file type '{filename}'. "
        "Please upload a PDF (.pdf) or Word document (.docx)."
    )
