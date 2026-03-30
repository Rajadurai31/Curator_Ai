import logging
from fastapi import APIRouter, HTTPException
from models.schemas import AnalysisInput
from services.skill_extractor import extract_resume_skills
from services.job_parser import extract_job_skills
from services.matching_engine import compute_match_score
from services.gap_analyzer import find_skill_gaps
from services.mentor_agent import generate_roadmap
from db.database import save_session

log = logging.getLogger("curator.analysis")
router = APIRouter()


@router.post("/full")
async def full_analysis(payload: AnalysisInput):
    """POST /api/analyze/full — full pipeline in one call"""
    log.info("full_analysis: resume=%d chars  job=%d chars",
             len(payload.resume_text), len(payload.job_text))

    if not payload.resume_text.strip():
        raise HTTPException(400, "resume_text cannot be empty.")
    if not payload.job_text.strip():
        raise HTTPException(400, "job_text cannot be empty.")

    try:
        # 1 — extract resume skills
        log.info("  [1/5] extracting resume skills…")
        resume_data = extract_resume_skills(payload.resume_text)
        resume_skills = resume_data.get("skills", []) + resume_data.get("tools", [])
        log.info("  [1/5] found %d resume skills: %s", len(resume_skills), resume_skills)

        # 2 — extract job skills
        log.info("  [2/5] extracting job skills…")
        job_data = extract_job_skills(payload.job_text)
        job_skills = job_data.get("required_skills", [])
        job_title = job_data.get("job_title", "")
        log.info("  [2/5] found %d job skills: %s  title=%r", len(job_skills), job_skills, job_title)

        # 3 — match score
        log.info("  [3/5] computing match score…")
        match_score = compute_match_score(resume_skills, job_skills)
        log.info("  [3/5] match score = %.1f%%", match_score)

        # 4 — skill gaps
        log.info("  [4/5] finding skill gaps…")
        gaps = find_skill_gaps(resume_skills, job_skills)
        log.info("  [4/5] %d gaps: %s", len(gaps), [g["skill"] for g in gaps])

        # 5 — roadmap
        log.info("  [5/5] generating roadmap…")
        roadmap = generate_roadmap([g["skill"] for g in gaps])
        log.info("  [5/5] roadmap has %d entries", len(roadmap))

    except Exception as e:
        log.exception("full_analysis: pipeline failed")
        raise HTTPException(500, f"Analysis failed: {e}")

    # Persist (non-blocking)
    try:
        sid = save_session(match_score, resume_skills, job_skills, gaps, roadmap)
        log.info("full_analysis: saved session id=%d", sid)
    except Exception as e:
        log.warning("full_analysis: DB save failed (non-fatal): %s", e)

    log.info("full_analysis: done ✅")
    return {
        "match_score":   match_score,
        "resume_skills": resume_skills,
        "job_skills":    job_skills,
        "job_title":     job_title,
        "skill_gaps":    gaps,
        "roadmap":       roadmap,
    }
