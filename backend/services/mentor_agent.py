import json
import logging
import os
from groq import Groq

log = logging.getLogger("curator.mentor_agent")
_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
    return _client


def generate_roadmap(missing_skills: list[str]) -> list[dict]:
    if not missing_skills:
        log.info("generate_roadmap: no missing skills - returning empty roadmap")
        return []

    skills_to_cover = missing_skills[:5]
    log.info("generate_roadmap: building plan for %s", skills_to_cover)

    prompt = f"""Create a 7-day learning roadmap for a job seeker who needs to learn: {skills_to_cover}

Return ONLY valid JSON - no extra text:
{{
  "roadmap": [
    {{
      "days": "Days 1-2",
      "skill": "Skill Name",
      "tasks": ["Specific task 1", "Specific task 2", "Specific task 3"],
      "status": "in-progress"
    }}
  ]
}}

Rules:
- Cover all skills across the 7 days, grouping related ones if needed
- First entry status = "in-progress", last entry status = "locked", rest = "upcoming"
- 3-4 tasks per entry, specific and actionable
- Use day ranges like "Days 1-2", "Days 3-4", "Day 7"
- Return between 3 and 5 entries total"""

    response = _get_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.3,
    )
    raw = response.choices[0].message.content
    log.info("generate_roadmap: raw response = %s", raw[:300])
    data = json.loads(raw)
    roadmap = data.get("roadmap", [])

    if roadmap:
        roadmap[0]["status"] = "in-progress"
        roadmap[-1]["status"] = "locked"
        for item in roadmap[1:-1]:
            item["status"] = "upcoming"

    log.info("generate_roadmap: %d entries generated", len(roadmap))
    return roadmap

