from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict
from app.schemas.skill import SkillResponse

class CareerBase(BaseModel):
    slug: str
    name: str
    category: str
    description: str
    icon: str = "🎯"
    market_demand_score: int = 90
    salary_range: str = "$100k - $150k"

class CareerResponse(CareerBase):
    id: str
    total_skills: int = 0

    model_config = ConfigDict(from_attributes=True)

class CareerDetailResponse(CareerBase):
    id: str
    skills: List[SkillResponse] = []
    skill_weights: Dict[str, float] = {}
    skill_importance: Dict[str, str] = {}
    target_proficiencies: Dict[str, float] = {}

    model_config = ConfigDict(from_attributes=True)


class SelectCareerRequest(BaseModel):
    career_slug: str
