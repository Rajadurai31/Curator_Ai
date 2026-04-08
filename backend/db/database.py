import os
import json
import ssl
import logging
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qs

from sqlalchemy import create_engine, Float, String, Text, Integer
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped, Session

log = logging.getLogger("curator.database")

# ── Build engine ──────────────────────────────────────────────────────────────
def _build_engine():
    raw_url = os.getenv("DATABASE_URL", "").strip()
    if not raw_url:
        log.warning("DATABASE_URL not set — DB persistence disabled")
        return None

    # pg8000 needs ssl passed as a connect_args dict, NOT as a URL query param.
    # Strip ?sslmode=... and ?channel_binding=... from the URL, then pass ssl ctx.
    parsed = urlparse(raw_url)
    qs = parse_qs(parsed.query)
    needs_ssl = qs.get("sslmode", [""])[0] in ("require", "verify-ca", "verify-full")

    # Rebuild clean URL without SSL query params
    clean_url = parsed._replace(query="").geturl()

    # Switch scheme to postgresql+pg8000
    if "+pg8000" not in clean_url:
        clean_url = clean_url.replace("postgresql://", "postgresql+pg8000://", 1)

    connect_args = {}
    if needs_ssl:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE   # Neon pooler uses self-signed cert
        connect_args["ssl_context"] = ctx

    log.info("DB engine: %s  ssl=%s", clean_url[:60] + "...", needs_ssl)
    return create_engine(clean_url, connect_args=connect_args, echo=False)


engine = _build_engine()


# ── ORM ───────────────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id:            Mapped[int]   = mapped_column(Integer, primary_key=True, autoincrement=True)
    match_score:   Mapped[float] = mapped_column(Float,   nullable=False)
    resume_skills: Mapped[str]   = mapped_column(Text,    nullable=False)
    job_skills:    Mapped[str]   = mapped_column(Text,    nullable=False)
    skill_gaps:    Mapped[str]   = mapped_column(Text,    nullable=False)
    roadmap:       Mapped[str]   = mapped_column(Text,    nullable=False)
    created_at:    Mapped[str]   = mapped_column(String(32), nullable=False)


def init_db():
    if engine is None:
        return
    Base.metadata.create_all(engine)
    log.info("DB tables ready")


def save_session(match_score: float, resume_skills: list, job_skills: list,
                 skill_gaps: list, roadmap: list) -> int:
    if engine is None:
        return -1
    with Session(engine) as session:
        record = AnalysisSession(
            match_score=match_score,
            resume_skills=json.dumps(resume_skills),
            job_skills=json.dumps(job_skills),
            skill_gaps=json.dumps(skill_gaps),
            roadmap=json.dumps(roadmap),
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        log.info("Saved session id=%d", record.id)
        return record.id


def get_session(session_id: int) -> dict | None:
    if engine is None:
        return None
    with Session(engine) as session:
        record = session.get(AnalysisSession, session_id)
        if not record:
            return None
        return {
            "id":            record.id,
            "match_score":   record.match_score,
            "resume_skills": json.loads(record.resume_skills),
            "job_skills":    json.loads(record.job_skills),
            "skill_gaps":    json.loads(record.skill_gaps),
            "roadmap":       json.loads(record.roadmap),
            "created_at":    record.created_at,
        }
