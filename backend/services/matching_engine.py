import logging
from sentence_transformers import SentenceTransformer, util

log = logging.getLogger("curator.matching_engine")
_model = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        log.info("Loading sentence-transformer model (first run may take ~30s)…")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        log.info("Model loaded ✅")
    return _model


def compute_match_score(resume_skills: list[str], job_skills: list[str]) -> float:
    if not resume_skills or not job_skills:
        log.warning("compute_match_score: empty skill list — returning 0")
        return 0.0

    model = _get_model()
    emb_resume = model.encode(", ".join(resume_skills), convert_to_tensor=True)
    emb_job    = model.encode(", ".join(job_skills),    convert_to_tensor=True)
    score = util.cos_sim(emb_resume, emb_job).item()
    pct = round(max(0.0, min(score * 100, 100.0)), 1)
    log.info("compute_match_score: %.1f%%", pct)
    return pct
