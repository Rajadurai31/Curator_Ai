import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from services.resume_parser import parse_resume

log = logging.getLogger("curator.resume")
router = APIRouter()

ALLOWED_EXTENSIONS = (".pdf", ".docx", ".txt")


@router.post("/upload")
async def upload_resume(request: Request, file: UploadFile = File(None)):
    """POST /api/resume/upload — PDF / DOCX / TXT → plain text"""

    if file is None:
        form = await request.form()
        keys = list(form.keys())
        log.error("No 'file' field. Got: %s", keys)
        raise HTTPException(400, f"No file field. Received: {keys}. Use field name 'file'.")

    log.info("upload_resume: %s", file.filename)

    if not file.filename:
        raise HTTPException(400, "No filename provided.")

    if not file.filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(400, f"Unsupported type. Upload PDF, DOCX, or TXT.")

    content = await file.read()
    log.info("upload_resume: read %d bytes", len(content))

    if len(content) == 0:
        raise HTTPException(400, "File is empty.")

    try:
        resume_text = parse_resume(content, file.filename)
    except ValueError as e:
        log.error("parse failed: %s", e)
        raise HTTPException(422, str(e))

    log.info("upload_resume: extracted %d chars", len(resume_text))
    return {"resume_text": resume_text}
