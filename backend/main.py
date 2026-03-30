from dotenv import load_dotenv
load_dotenv()  # must be first — loads .env before any service imports

import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from routers import resume, job, analysis
from routers.jobs_search import router as jobs_search_router
from db.database import init_db

# ── Logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("curator")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Curator AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router,       prefix="/api/resume",  tags=["Resume"])
app.include_router(job.router,          prefix="/api/job",     tags=["Job"])
app.include_router(analysis.router,     prefix="/api/analyze", tags=["Analysis"])
app.include_router(jobs_search_router,  prefix="/api/jobs",    tags=["Jobs Search"])


# ── Request logger middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    log.info("→ %s %s", request.method, request.url.path)
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    log.info("← %s %s  %d  %.0fms",
             request.method, request.url.path, response.status_code, ms)
    return response


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    log.info("Starting Curator AI backend…")
    try:
        init_db()
        log.info("✅ Database tables ready")
    except Exception as e:
        log.warning("⚠️  DB init skipped: %s", e)
    log.info("✅ Server ready — http://localhost:8000")
    log.info("   Docs: http://localhost:8000/docs")


@app.get("/health")
def health():
    return {"status": "ok"}
