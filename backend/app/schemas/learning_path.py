from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.schemas.resource import ResourceResponse

class LearningPathItemResponse(BaseModel):
    id: str
    step_order: int
    skill_id: str
    skill_slug: str
    skill_name: str
    category: str
    status: str
    recommendation_reason: Optional[str] = None
    estimated_hours: int
    resource: Optional[ResourceResponse] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class LearningPathResponse(BaseModel):
    id: str
    user_id: str
    career_id: str
    career_name: str
    status: str
    milestones: List[LearningPathItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
