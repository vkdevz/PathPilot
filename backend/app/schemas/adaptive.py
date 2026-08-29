from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class EvidenceSubmission(BaseModel):
    skill_id: str
    evidence_type: str = Field(..., description="ASSESSMENT, QUIZ, PROJECT, RESOURCE_COMPLETION, SELF_REPORT, FEEDBACK, REPEATED_PERFORMANCE")
    score: float = Field(..., description="Score 0.0 - 1.0 or percentage 0 - 100")
    raw_score: Optional[float] = None
    source_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class FeedbackInterpretationRequest(BaseModel):
    comment: str = Field(..., description="Qualitative natural-language feedback comment")
    resource_id: Optional[str] = None

class AdaptationEventResponse(BaseModel):
    id: str
    event_type: str
    trigger: str
    reason: str
    previous_state: Dict[str, Any]
    new_state: Dict[str, Any]
    algorithm_version: str
    created_at: Optional[str] = None

class SkillStateSummary(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    proficiency: float
    score_pct: float
    confidence: float
    mastery_state: str
    evidence_source: str
    status: str

class LearnerAdaptiveStateResponse(BaseModel):
    user_id: str
    display_name: str
    target_career: str
    career_readiness_pct: float
    estimated_learning_pace: str
    pace_velocity_ratio: float
    skills: List[SkillStateSummary]
    next_best_skill: Optional[Dict[str, Any]] = None
    bottleneck_skills: List[Dict[str, Any]] = []
    recent_adaptations: List[Dict[str, Any]] = []

class ProgressHistoryPoint(BaseModel):
    id: str
    skill_id: str
    skill_name: str
    proficiency: float
    score_pct: float
    confidence: float
    mastery_state: str
    struggle_state: str
    trigger_event: Optional[str] = None
    created_at: Optional[str] = None

class RoadmapVersionResponse(BaseModel):
    id: str
    version_number: int
    learning_path_id: str
    reason: str
    milestones_count: int
    milestones: List[Dict[str, Any]]
    is_active: bool
    created_at: Optional[str] = None
