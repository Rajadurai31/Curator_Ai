import json
import logging
import os
from groq import Groq

log = logging.getLogger("curator.job_parser")
_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        key = os.getenv("GROQ_API_KEY", "")
        if not key:
            raise RuntimeError("GROQ_API_KEY is not set in .env")
        _client = Groq(api_key=key)
    return _client


def extract_job_skills(job_text: str) -> dict:
    log.info("extract_job_skills: sending %d chars to Groq", len(job_text))
    prompt = f"""You are a job description parser. Extract skills from the job posting below.
Return ONLY valid JSON with this exact shape â€” no extra text:
{{
  "required_skills": ["Python", "AWS"],
  "nice_to_have": ["Kubernetes"],
  "job_title": "Backend Engineer"
}}

Job description (first 3000 chars):
{job_text[:3000]}"""

    response = _get_client().chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    raw = response.choices[0].message.content
    log.info("extract_job_skills: raw response = %s", raw[:200])
    data = json.loads(raw)
    result = {
        "required_skills": data.get("required_skills", []),
        "nice_to_have": data.get("nice_to_have", []),
        "job_title": data.get("job_title", ""),
    }
    log.info("extract_job_skills: required=%s", result["required_skills"])
    return result

