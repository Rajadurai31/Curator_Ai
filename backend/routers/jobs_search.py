import logging
import os
import httpx
from fastapi import APIRouter, HTTPException, Query

log = logging.getLogger("curator.jobs_search")
router = APIRouter()

RAPID_API_KEY = os.getenv("RAPID_API_KEY", "")
RAPID_API_HOST = "jsearch.p.rapidapi.com"


@router.get("/search")
async def search_jobs(
    query: str = Query(..., description="Job title or keywords"),
    location: str = Query("", description="City or country"),
    page: int = Query(1, ge=1),
):
    """
    GET /api/jobs/search?query=Python+Developer&location=Remote
    Fetches live job listings from JSearch (RapidAPI).
    Returns a simplified list ready for the frontend.
    """
    if not RAPID_API_KEY:
        raise HTTPException(500, "RAPID_API_KEY not set in .env")

    params = {
        "query": f"{query} {location}".strip(),
        "page": str(page),
        "num_pages": "1",
        "date_posted": "all",
    }
    headers = {
        "X-RapidAPI-Key": RAPID_API_KEY,
        "X-RapidAPI-Host": RAPID_API_HOST,
    }

    log.info("search_jobs: query=%r location=%r page=%d", query, location, page)

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(
                f"https://{RAPID_API_HOST}/search",
                params=params,
                headers=headers,
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            log.error("search_jobs: RapidAPI error %s", e)
            raise HTTPException(502, f"Job search API error: {e.response.status_code}")
        except httpx.RequestError as e:
            log.error("search_jobs: request failed %s", e)
            raise HTTPException(502, "Could not reach job search API")

    data = resp.json()
    raw_jobs = data.get("data", [])
    log.info("search_jobs: got %d results", len(raw_jobs))

    # Simplify to what the frontend needs
    jobs = [
        {
            "id": j.get("job_id", ""),
            "title": j.get("job_title", ""),
            "company": j.get("employer_name", ""),
            "location": j.get("job_city") or j.get("job_country") or "Remote",
            "type": j.get("job_employment_type", ""),
            "posted": j.get("job_posted_at_datetime_utc", ""),
            "description": (j.get("job_description") or "")[:500],
            "url": j.get("job_apply_link") or j.get("job_google_link") or "",
            "logo": j.get("employer_logo") or "",
        }
        for j in raw_jobs
    ]

    return {"jobs": jobs, "total": len(jobs), "page": page}
