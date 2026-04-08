import json
import logging
import os
from groq import Groq

log = logging.getLogger("curator.gap_analyzer")
_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
    return _client


def find_skill_gaps(resume_skills: list[str], job_skills: list[str]) -> list[dict]:
    resume_lower = {s.lower() for s in resume_skills}
    missing = [s for s in job_skills if s.lower() not in resume_lower]
    log.info("find_skill_gaps: %d missing skills: %s", len(missing), missing)

    if not missing:
        return []

    prompt = f"""Classify each missing skill as "Critical" or "Secondary" for a job seeker.
Critical = core requirement; Secondary = nice-to-have or supporting skill.
Return ONLY valid JSON â€” no extra text:
{{
  "gaps": [
    {{"skill": "Docker", "level": "Critical"}},
    {{"skill": "GraphQL", "level": "Secondary"}}
  ]
}}

Missing skills: {missing}"""

    response = _get_client().chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    raw = response.choices[0].message.content
    log.info("find_skill_gaps: raw response = %s", raw[:200])
    data = json.loads(raw)
    gaps = data.get("gaps", [])

    if not gaps:
        gaps = [{"skill": s, "level": "Secondary"} for s in missing]

    log.info("find_skill_gaps: classified %d gaps", len(gaps))
    return gaps

