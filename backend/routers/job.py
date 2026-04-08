from fastapi import APIRouter, HTTPException
from models.schemas import JobInput
from services.job_parser import extract_job_skills

router = APIRouter()


@router.post("/parse")
async def parse_job(payload: JobInput):
    """
    Utility endpoint — parse a job description independently.
    Not called by the frontend directly (frontend uses /api/analyze/full).
    Response: { required_skills, nice_to_have, job_title }
    """
    if not payload.job_text.strip():
        raise HTTPException(status_code=400, detail="job_text cannot be empty.")

    try:
        result = extract_job_skills(payload.job_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job parsing failed: {e}")

    return result
