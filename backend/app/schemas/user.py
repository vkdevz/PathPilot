from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class LearnerProfileBase(BaseModel):
    target_career_id: Optional[str] = None
    target_career_name: Optional[str] = None
    experience_level: str = "beginner"
    learning_pace: str = "moderate"
    preferred_format: str = "interactive"
    weekly_hours_goal: int = 5
    preferences: Dict[str, Any] = Field(default_factory=dict)

class LearnerProfileUpdate(BaseModel):
    target_career_id: Optional[str] = None
    experience_level: Optional[str] = None
    learning_pace: Optional[str] = None
    preferred_format: Optional[str] = None
    weekly_hours_goal: Optional[int] = None
    preferences: Optional[Dict[str, Any]] = None

class LearnerProfileResponse(LearnerProfileBase):
    id: str
    user_id: str
    xp: int
    streak_days: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: str
    display_name: Optional[str] = "Learner"
    avatar_url: Optional[str] = None
    role: str = "learner"

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    display_name: Optional[str] = "Learner"
    target_career_id: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserSyncRequest(BaseModel):
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    target_career_slug: Optional[str] = None
    target_career_id: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UserResponse(UserBase):
    id: str
    profile: Optional[LearnerProfileResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: UserResponse
