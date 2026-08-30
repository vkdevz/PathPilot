from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class QuestionResponse(BaseModel):
    id: str
    skill_id: str
    skill_name: Optional[str] = None
    difficulty: str
    question_text: str
    options: List[str]

    model_config = ConfigDict(from_attributes=True)

class QuestionDetailResponse(QuestionResponse):
    correct_answer_index: int
    explanation: Optional[str] = None

class AssessmentDetailResponse(BaseModel):
    id: str
    career_id: str
    career_name: str
    career_slug: Optional[str] = None
    title: str
    total_questions: int
    questions: List[QuestionResponse] = []

    model_config = ConfigDict(from_attributes=True)

class SingleAnswerSubmission(BaseModel):
    question_id: str
    selected_option: int

class AssessmentSubmitRequest(BaseModel):
    career_slug: Optional[str] = None
    answers: List[SingleAnswerSubmission]

class TopicScoreResult(BaseModel):
    skill_id: str
    skill_name: str
    score: float
    strength_level: str  # Strong, Moderate, Weak
    correct_count: int
    total_count: int

class AssessmentResultResponse(BaseModel):
    attempt_id: str
    career_id: Optional[str] = None
    career_slug: Optional[str] = None
    career_name: Optional[str] = None
    overall_score: float
    position_rank: Optional[str] = None
    percentile_rank: Optional[float] = None
    strong_topics: List[Dict[str, Any]]
    moderate_topics: List[Dict[str, Any]]
    weak_topics: List[Dict[str, Any]]
    topic_scores: List[TopicScoreResult]
    recommendations: Optional[List[Dict[str, Any]]] = None
    completed_at: datetime
