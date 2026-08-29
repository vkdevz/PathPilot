from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ProgressLogRequest(BaseModel):
    resource_id: str
    time_spent_minutes: int
    status: str = "completed"

class ProgressResponse(BaseModel):
    id: str
    user_id: str
    resource_id: str
    time_spent_minutes: int
    status: str
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class HeatmapDay(BaseModel):
    date: str
    minutes: int
    intensity: int  # 0, 1, 2, 3

class LeaderboardUserResponse(BaseModel):
    rank: int
    user_id: str
    name: str
    xp: int
    streak: int
    career: str
    is_current: bool = False
