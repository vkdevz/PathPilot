from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

class FeatureScoreBreakdown(BaseModel):
    skill_gap: float = Field(..., description="Skill gap reduction score [0, 1]")
    career_alignment: float = Field(..., description="Target career requirement weight [0, 1]")
    roadmap_affinity: float = Field(..., description="Active roadmap milestone relevance [0, 1]")
    semantic_similarity: float = Field(..., description="pgvector semantic similarity [0, 1]")
    difficulty_fit: float = Field(..., description="Difficulty alignment with learner proficiency [0, 1]")
    format_preference: float = Field(..., description="Resource format vs preferred format [0, 1]")
    pacing_fit: float = Field(..., description="Duration fit against learner pace [0, 1]")
    feedback_prior: float = Field(..., description="Historical feedback prior adjustment [0, 1]")
    composite_score: float = Field(..., description="Weighted composite score [0, 1]")

class RecommendationExplanationDetail(BaseModel):
    headline: str
    reasons: List[str]
    target_gap_description: Optional[str] = None
    milestone_connection: Optional[str] = None
    match_tier: str = "Top Recommendation"

class PersonalizedRecommendationItem(BaseModel):
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
    skills_taught: List[str] = []
    target_skill_slug: Optional[str] = None
    target_skill_name: Optional[str] = None
    relevance_score: int = 90
    match_tier: str = "Top Recommendation"
    explanation_reasons: List[str] = []
    feature_breakdown: Optional[FeatureScoreBreakdown] = None

    model_config = ConfigDict(from_attributes=True)

class NextBestActionResponse(BaseModel):
    resource_id: str
    slug: str
    title: str
    description: str
    resource_type: str
    difficulty: str
    estimated_minutes: int
    provider: str
    url: Optional[str] = None
    is_interactive: bool = False
    target_skill_name: str
    target_skill_slug: str
    current_skill_score: float
    target_milestone_step: Optional[int] = None
    relevance_score: int
    headline: str
    primary_reason: str
    reasons: List[str]
    feature_breakdown: Optional[FeatureScoreBreakdown] = None

    model_config = ConfigDict(from_attributes=True)

class RecommendationFeedbackCreate(BaseModel):
    resource_id: str
    feedback_type: str = Field(..., description="started, completed, saved, dismissed, too_easy, too_hard, helpful, irrelevant")
    rating: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None

class RecommendationFeedbackResponse(BaseModel):
    id: str
    resource_id: str
    feedback_type: str
    status: str = "success"
    message: str

class RecommendationObservabilityResponse(BaseModel):
    algorithm_version: str = "hybrid-v2.0"
    engine_health: str = "healthy"
    weights_configuration: Dict[str, float]
    total_recommendation_runs: int
    avg_latency_ms: float
    avg_intra_list_diversity: float
    total_feedbacks_recorded: int

class BaselineComparisonMetric(BaseModel):
    model_name: str
    precision_at_k: float
    recall_at_k: float
    ndcg_at_k: float
    intra_list_diversity: float
    catalog_coverage_pct: float
    prerequisite_violation_rate: float
    avg_latency_ms: float

class RecommendationEvaluationReport(BaseModel):
    status: str = "completed"
    k: int = 5
    total_test_learners: int
    comparison: List[BaselineComparisonMetric]
    hybrid_summary: Dict[str, Any]
    total_duration_ms: float
