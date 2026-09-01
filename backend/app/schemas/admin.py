from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class AdminUserRecord(BaseModel):
    id: str
    email: str
    display_name: str
    role: str
    target_career_name: Optional[str] = None
    target_career_slug: Optional[str] = None
    experience_level: str = "beginner"
    learning_pace: str = "moderate"
    weekly_hours_goal: int = 5
    xp: int = 0
    streak_days: int = 1
    total_study_minutes: int = 0
    total_study_sessions: int = 0
    total_completed_learning: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AdminOverviewStats(BaseModel):
    total_registered_users: int
    total_learners: int
    total_admins: int
    total_xp_awarded: int
    total_study_minutes_logged: int
    total_study_sessions_logged: int
    total_verified_completions: int
    career_distribution: List[Dict[str, Any]]
    recent_registrations: List[AdminUserRecord]

class UserRoleUpdateRequest(BaseModel):
    role: str # "learner" or "admin"
