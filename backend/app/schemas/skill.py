from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class SkillBase(BaseModel):
    slug: str
    name: str
    category: str
    difficulty: str
    level: int
    description: str
    estimated_minutes: int

class SkillResponse(SkillBase):
    id: str
    prerequisites: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class LearnerSkillResponse(BaseModel):
    id: str
    skill_id: str
    skill_slug: str
    skill_name: str
    category: str
    score: float
    status: str
    last_assessed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
