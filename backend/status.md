# Curator AI — Backend Status

> Last updated: March 30, 2026  
> Backend folder: `Curator_Ai/backend/`

---

## Environment

| Variable | Status |
|---|---|
| `DATABASE_URL` | ✅ Set (Neon PostgreSQL) |
| `GROQ_API_KEY` | ✅ Set |

---

## File Status

| File | Exists | Status |
|---|---|---|
| `main.py` | ✅ | Done |
| `requirements.txt` | ✅ | Done |
| `routers/resume.py` | ✅ | Done |
| `routers/job.py` | ✅ | Done (utility route) |
| `routers/analysis.py` | ✅ | Done |
| `services/resume_parser.py` | ✅ | Done |
| `services/skill_extractor.py` | ✅ | Done |
| `services/job_parser.py` | ✅ | Done |
| `services/matching_engine.py` | ✅ | Done |
| `services/gap_analyzer.py` | ✅ | Done |
| `services/mentor_agent.py` | ✅ | Done |
| `models/schemas.py` | ✅ | Done |
| `db/database.py` | ✅ | Done |
| `.env` | ✅ | Done |

---

## All Steps Complete

| Step | Description | Status |
|---|---|---|
| 1 | Project bootstrap — `main.py`, CORS, startup hook | ✅ |
| 2 | Resume parser — PDF/DOCX → text (`/api/resume/upload`) | ✅ |
| 3 | Resume skill extractor — Groq LLM | ✅ |
| 4 | Job description parser — Groq LLM | ✅ |
| 5 | Matching engine — sentence-transformers cosine similarity | ✅ |
| 6 | Skill gap analyzer — set diff + Groq classification | ✅ |
| 7 | Mentor agent — Groq 7-day roadmap generator | ✅ |
| 8 | `/api/analyze/full` — orchestrates Steps 3–7, persists to DB | ✅ |
| 9 | Database persistence — Neon PostgreSQL via SQLAlchemy | ✅ |

---

## How to Run

```bash
# from Curator_Ai/backend/
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

---

## Notes

- `POST /api/job/parse` exists as a utility/debug route — the frontend does not call it directly
- DB tables are created automatically on first startup via `init_db()`
- Each `/api/analyze/full` call saves the result to `analysis_sessions` table
- sentence-transformers model (`all-MiniLM-L6-v2`) downloads ~80 MB on first run and is cached
