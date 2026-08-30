from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class StudySessionCreateRequest(BaseModel):
    topic: str = Field(..., min_length=1, description="Topic or Resource name studied")
    duration_minutes: int = Field(..., ge=1, le=720, description="Duration in minutes")
    resource_id: Optional[str] = Field(None, description="Optional linked resource ID or slug")
    session_date: Optional[datetime] = Field(None, description="Date and time of study session")
    notes: Optional[str] = Field(None, description="Optional learner notes")

class StudySessionResponse(BaseModel):
    id: str
    user_id: str
    topic: str
    duration_minutes: int
    session_date: datetime
    notes: Optional[str] = None
    xp_earned: int
    resource_id: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class StudyTimeSummaryResponse(BaseModel):
    today_minutes: int
    this_week_minutes: int
    this_week_sessions: int
    this_month_minutes: int
    total_minutes: int
    total_sessions: int
    total_xp: int
    streak_days: int

class CompleteResourceRequest(BaseModel):
    resource_id: str = Field(..., description="ID or slug of completed resource")
    time_spent_minutes: Optional[int] = Field(None, description="Actual minutes spent if logged")

class ResourceCompletionResponse(BaseModel):
    id: str
    user_id: str
    resource_id: str
    resource_title: str
    resource_type: str
    status: str
    xp_earned: int
    already_completed: bool
    completed_at: datetime

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
    xp_earned: int = 50

    model_config = ConfigDict(from_attributes=True)

class HeatmapDay(BaseModel):
    date: str
    minutes: int
    intensity: int  # 0, 1, 2, 3

class CompletedLearningItem(BaseModel):
    id: str
    resource_id: str
    resource_title: str
    resource_type: str
    resource_slug: Optional[str] = None
    skills_taught: List[str] = []
    time_spent_minutes: int
    xp_earned: int
    status: str
    completed_at: Optional[datetime] = None

class LeaderboardUserResponse(BaseModel):
    rank: int
    user_id: str
    name: str
    xp: int
    streak: int
    career: str
    is_current: bool = False
