import json
import logging
import os
from groq import Groq

log = logging.getLogger("curator.skill_extractor")
_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        key = os.getenv("GROQ_API_KEY", "")
        if not key:
            raise RuntimeError("GROQ_API_KEY is not set in .env")
        _client = Groq(api_key=key)
        log.info("Groq client initialised")
    return _client


def extract_resume_skills(resume_text: str) -> dict:
    log.info("extract_resume_skills: sending %d chars to Groq", len(resume_text))
    prompt = f"""You are a resume parser. Extract technical skills from the resume below.
Return ONLY valid JSON with this exact shape â€” no extra text:
{{
  "skills": ["Python", "SQL"],
  "tools": ["Docker", "Git"],
  "experience_years": 3
}}

Resume (first 3000 chars):
{resume_text[:3000]}"""

    response = _get_client().chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    raw = response.choices[0].message.content
    log.info("extract_resume_skills: raw response = %s", raw[:200])
    data = json.loads(raw)
    result = {
        "skills": data.get("skills", []),
        "tools": data.get("tools", []),
        "experience_years": data.get("experience_years", 0),
    }
    log.info("extract_resume_skills: skills=%s tools=%s",
             result["skills"], result["tools"])
    return result

