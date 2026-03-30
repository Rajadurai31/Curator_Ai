import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from services.resume_parser import parse_resume

log = logging.getLogger("curator.resume")
router = APIRouter()


@router.post("/upload")
async def upload_resume(request: Request, file: UploadFile = File(None)):
    """POST /api/resume/upload — PDF/DOCX → plain text"""

    # Debug: log what was actually received
    content_type = request.headers.get("content-type", "")
    log.info("upload_resume: content-type=%s", content_type)

    if file is None:
        # Try to give a helpful error — field name mismatch
        form = await request.form()
        keys = list(form.keys())
        log.error("upload_resume: no 'file' field. Got fields: %s", keys)
        raise HTTPException(400, f"No file field found. Received fields: {keys}. Send the file under the field name 'file'.")

    log.info("upload_resume: filename=%s", file.filename)

    if not file.filename:
        raise HTTPException(400, "No file provided.")

    if not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(400, f"Unsupported file type '{file.filename}'. Upload PDF or DOCX.")

    content = await file.read()
    log.info("upload_resume: read %d bytes", len(content))

    if len(content) == 0:
        raise HTTPException(400, "Uploaded file is empty.")

    try:
        resume_text = parse_resume(content, file.filename)
    except ValueError as e:
        log.error("upload_resume: parse failed — %s", e)
        raise HTTPException(422, str(e))

    log.info("upload_resume: extracted %d chars of text", len(resume_text))
    return {"resume_text": resume_text}
