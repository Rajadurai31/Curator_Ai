import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.resume_parser import parse_resume

log = logging.getLogger("curator.resume")
router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """POST /api/resume/upload — PDF/DOCX → plain text"""
    log.info("upload_resume: filename=%s size=?", file.filename)

    if not file.filename:
        raise HTTPException(400, "No file provided.")

    if not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(400, "Only PDF and DOCX files are supported.")

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
