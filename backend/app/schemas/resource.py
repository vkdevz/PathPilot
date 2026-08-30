from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class ResourceBase(BaseModel):
    slug: str
    title: str
    description: str
    resource_type: str
    url: Optional[str] = None
    difficulty: str = "Beginner"
    estimated_minutes: int = 60
    provider: str = "PathPilot Academy"
    is_interactive: bool = False
    content: Optional[str] = None

class ResourceResponse(ResourceBase):
    id: str
    skills_taught: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class RecommendationResponse(BaseModel):
    id: str
    resource_id: str
    slug: str
    title: str
    description: str
    resource_type: str
    url: Optional[str] = None
    difficulty: str = "Beginner"
    estimated_minutes: int = 60
    provider: str = "PathPilot Academy"
    is_interactive: bool = False
    content: Optional[str] = None
    skills_taught: List[str] = []
    target_skill_slug: Optional[str] = None
    target_skill_name: Optional[str] = None
    relevance_score: int = 90
    match_tier: str = "High Match"
    explanation_reasons: List[str] = []

    model_config = ConfigDict(from_attributes=True)


