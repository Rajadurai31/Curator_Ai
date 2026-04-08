# Curator AI — Backend Implementation Plan

> FastAPI Python backend. All steps are pending — no backend exists yet.

---

## Project Structure (Target)

```
Curator_Ai/backend/
├── .env                    # already exists (Neon PostgreSQL URL)
├── main.py                 # FastAPI app entry point
├── requirements.txt
├── routers/
│   ├── resume.py           # /api/resume endpoints
│   ├── job.py              # /api/job endpoints
│   └── analysis.py         # /api/analyze endpoints
├── services/
│   ├── resume_parser.py    # PDF/DOCX → text
│   ├── skill_extractor.py  # LLM skill extraction
│   ├── job_parser.py       # job description → skills
│   ├── matching_engine.py  # embedding similarity
│   ├── gap_analyzer.py     # missing skills
│   └── mentor_agent.py     # 7-day roadmap generator
├── models/
│   └── schemas.py          # Pydantic request/response models
└── db/
    └── database.py         # SQLAlchemy / asyncpg setup
```

---

## Step 1 — Project Bootstrap

**Status:** Pending  
**File:** `main.py`

Install dependencies and configure CORS so the React frontend on `localhost:5173` can reach the API.

```bash
pip install fastapi uvicorn python-multipart python-dotenv \
  pdfplumber python-docx groq sentence-transformers \
  sqlalchemy asyncpg psycopg2-binary
```

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, job, analysis

app = FastAPI(title="Curator AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api/resume")
app.include_router(job.router, prefix="/api/job")
app.include_router(analysis.router, prefix="/api/analyze")
```

Run: `uvicorn main:app --reload`

---

## Step 2 — Resume Parser

**Status:** Pending  
**File:** `services/resume_parser.py`  
**Endpoint:** `POST /api/resume/upload`

Accepts a PDF or DOCX file upload, returns clean plain text.

```python
import pdfplumber
from docx import Document
from io import BytesIO

def parse_resume(file_bytes: bytes, filename: str) -> str:
    if filename.endswith(".pdf"):
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    elif filename.endswith(".docx"):
        doc = Document(BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs)
    raise ValueError("Unsupported file type. Upload PDF or DOCX.")
```

```python
# routers/resume.py
@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    content = await file.read()
    text = parse_resume(content, file.filename)
    return {"resume_text": text}
```

---

## Step 3 — Resume Skill Extractor

**Status:** Pending  
**File:** `services/skill_extractor.py`  
**Requires:** `GROQ_API_KEY` in `.env`

Uses Groq LLM to extract structured skills, tools, and experience years from resume text.

```python
from groq import Groq
import json, os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_resume_skills(resume_text: str) -> dict:
    prompt = f"""
Extract skills from this resume. Return ONLY valid JSON:
{{
  "skills": ["skill1", "skill2"],
  "tools": ["tool1"],
  "experience_years": 3
}}

Resume:
{resume_text[:3000]}
"""
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)
```

---

## Step 4 — Job Description Parser

**Status:** Pending  
**File:** `services/job_parser.py`  
**Endpoint:** `POST /api/job/parse`

Extracts required skills from raw pasted job description text.

```python
def extract_job_skills(job_text: str) -> dict:
    prompt = f"""
Extract required skills from this job description. Return ONLY valid JSON:
{{
  "required_skills": ["skill1", "skill2"],
  "nice_to_have": ["skill3"],
  "job_title": "Role Title"
}}

Job Description:
{job_text[:3000]}
"""
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)
```

```python
# routers/job.py
@router.post("/parse")
async def parse_job(payload: JobInput):
    return extract_job_skills(payload.job_text)
```

---

## Step 5 — Matching Engine

**Status:** Pending  
**File:** `services/matching_engine.py`

Encodes resume skills and job skills as sentence embeddings, computes cosine similarity, returns a match percentage (0–100).

```python
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")

def compute_match_score(resume_skills: list[str], job_skills: list[str]) -> float:
    emb_resume = model.encode(", ".join(resume_skills), convert_to_tensor=True)
    emb_job    = model.encode(", ".join(job_skills),    convert_to_tensor=True)
    score = util.cos_sim(emb_resume, emb_job).item()
    return round(score * 100, 1)
```

---

## Step 6 — Skill Gap Analyzer

**Status:** Pending  
**File:** `services/gap_analyzer.py`

Set-difference of job skills vs resume skills, then LLM classifies each gap as `Critical` or `Secondary`.

```python
def find_skill_gaps(resume_skills: list[str], job_skills: list[str]) -> list[dict]:
    resume_lower = {s.lower() for s in resume_skills}
    missing = [s for s in job_skills if s.lower() not in resume_lower]

    prompt = f"""
Classify each missing skill as "Critical" or "Secondary".
Return ONLY valid JSON: {{"gaps": [{{"skill": "Docker", "level": "Critical"}}]}}

Missing skills: {missing}
"""
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    data = json.loads(response.choices[0].message.content)
    return data.get("gaps", [{"skill": s, "level": "Secondary"} for s in missing])
```

---

## Step 7 — Mentor Agent (Roadmap Generator)

**Status:** Pending  
**File:** `services/mentor_agent.py`

Takes missing skills, generates a structured 7-day learning plan via Groq LLM.

```python
def generate_roadmap(missing_skills: list[str]) -> list[dict]:
    prompt = f"""
Create a 7-day learning roadmap for: {missing_skills}

Return ONLY valid JSON:
{{
  "roadmap": [
    {{
      "days": "Days 1-2",
      "skill": "Skill Name",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "status": "in-progress"
    }}
  ]
}}

Rules:
- First entry status = "in-progress", rest = "upcoming", last = "locked"
- 3-4 tasks per entry, specific and actionable
"""
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    data = json.loads(response.choices[0].message.content)
    return data.get("roadmap", [])
```

---

## Step 8 — Main Analysis Endpoint

**Status:** Pending  
**File:** `routers/analysis.py`  
**Endpoint:** `POST /api/analyze/full`

Orchestrates Steps 3–7 in a single call. The frontend sends resume text + job text and receives everything needed to render all three pages.

```python
@router.post("/full")
async def full_analysis(payload: AnalysisInput):
    resume_data   = extract_resume_skills(payload.resume_text)
    job_data      = extract_job_skills(payload.job_text)

    resume_skills = resume_data.get("skills", []) + resume_data.get("tools", [])
    job_skills    = job_data.get("required_skills", [])

    match_score   = compute_match_score(resume_skills, job_skills)
    gaps          = find_skill_gaps(resume_skills, job_skills)
    roadmap       = generate_roadmap([g["skill"] for g in gaps])

    return {
        "match_score":   match_score,    # → MatchGauge
        "resume_skills": resume_skills,  # → Tracker skill bars
        "job_skills":    job_skills,
        "skill_gaps":    gaps,           # → SkillGaps
        "roadmap":       roadmap,        # → Roadmap + Learning weekPlan
    }
```

```python
# models/schemas.py
from pydantic import BaseModel

class JobInput(BaseModel):
    job_text: str

class AnalysisInput(BaseModel):
    resume_text: str
    job_text: str
```

---

## Step 9 — Database Integration (Neon PostgreSQL)

**Status:** Pending  
**File:** `db/database.py`  
**Note:** `DATABASE_URL` already set in `.env`

Persist analysis sessions so users can return to results and track applications over time.

```python
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped
import os

DATABASE_URL = os.getenv("DATABASE_URL").replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL)

class Base(DeclarativeBase):
    pass

class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"
    id:          Mapped[int]   = mapped_column(primary_key=True)
    match_score: Mapped[float]
    skill_gaps:  Mapped[str]   # JSON string
    roadmap:     Mapped[str]   # JSON string
    created_at:  Mapped[str]
```

Run `Base.metadata.create_all(engine)` for MVP, or use Alembic for migrations.

---

## Environment Variables

```env
# Curator_Ai/backend/.env
DATABASE_URL=postgresql://...   # already set (Neon)
GROQ_API_KEY=                   # get from console.groq.com (free tier)
```

---

## Implementation Order

| # | Step | Effort |
|---|------|--------|
| 1 | Project bootstrap + CORS | ~30 min |
| 2 | Resume parser (PDF/DOCX) | ~1 hr |
| 3 | Resume skill extractor (Groq) | ~1 hr |
| 4 | Job description parser (Groq) | ~30 min |
| 5 | Matching engine (embeddings) | ~1 hr |
| 6 | Skill gap analyzer | ~30 min |
| 7 | Mentor agent / roadmap | ~1 hr |
| 8 | `/api/analyze/full` endpoint | ~30 min |
| 9 | Database persistence (Neon) | ~2 hr |
