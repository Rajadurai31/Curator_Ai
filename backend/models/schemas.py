from pydantic import BaseModel
from typing import List


class JobInput(BaseModel):
    job_text: str


class AnalysisInput(BaseModel):
    resume_text: str
    job_text: str


class SkillGap(BaseModel):
    skill: str
    level: str  # "Critical" | "Secondary"


class RoadmapItem(BaseModel):
    days: str
    skill: str
    tasks: List[str]
    status: str  # "in-progress" | "upcoming" | "locked"


class AnalysisResult(BaseModel):
    match_score: float
    resume_skills: List[str]
    job_skills: List[str]
    skill_gaps: List[SkillGap]
    roadmap: List[RoadmapItem]
