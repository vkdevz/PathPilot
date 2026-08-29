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

class ResourceResponse(ResourceBase):
    id: str
    skills_taught: List[str] = []

    model_config = ConfigDict(from_attributes=True)
