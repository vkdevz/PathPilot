from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class SkillBase(BaseModel):
    slug: str
    name: str
    category: str
    domain: str = "General"
    difficulty: str = "Beginner"
    level: int = 1
    description: str
    estimated_minutes: int = 90
    is_active: bool = True

class SkillPrerequisiteNode(BaseModel):
    id: str
    slug: str
    name: str
    category: str
    domain: str = "General"
    difficulty: str = "Beginner"
    level: int = 1
    relationship_type: str = "prerequisite"
    strength: float = 1.0
    depth: int = 1

class SkillResponse(SkillBase):
    id: str
    prerequisites: List[str] = []
    downstream_skills: List[str] = []
    resource_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class SkillDetailResponse(SkillResponse):
    prerequisite_nodes: List[SkillPrerequisiteNode] = []
    downstream_nodes: List[SkillPrerequisiteNode] = []
    metadata_json: Dict[str, Any] = {}

class PrerequisiteGraphResponse(BaseModel):
    target_skill_id: str
    target_skill_slug: str
    target_skill_name: str
    direct_prerequisites: List[SkillPrerequisiteNode] = []
    transitive_prerequisites: List[SkillPrerequisiteNode] = []
    downstream_unlocked: List[SkillPrerequisiteNode] = []
    max_prerequisite_depth: int = 0
    is_foundation: bool = False

class LearnerSkillResponse(BaseModel):
    id: str
    skill_id: str
    skill_slug: str
    skill_name: str
    category: str
    domain: str = "General"
    score: float = 0.0                      # 0 - 100
    proficiency: float = 0.0                # 0.0 - 1.0
    confidence: float = 0.5                 # 0.0 - 1.0
    evidence_source: str = "self_report"    # assessment, verified_practice, completed_resource, self_report, inferred
    assessment_score: Optional[float] = None
    self_reported_score: Optional[float] = None
    status: str = "locked"
    last_assessed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class IntelligentSkillGapResponse(BaseModel):
    skill_id: str
    skill_slug: str
    skill_name: str
    category: str
    domain: str
    difficulty: str
    level: int

    # Proficiency Metrics (Normalized & Display)
    current_proficiency: float              # 0.0 - 1.0
    current_score: float                    # 0 - 100
    target_proficiency: float               # 0.0 - 1.0
    target_score: float                     # 0 - 100
    raw_gap: float                          # 0.0 - 1.0 (target - current)
    confidence: float                       # 0.0 - 1.0
    evidence_source: str

    # Career Alignment
    career_importance: str                  # critical, high, medium, low
    career_importance_score: float          # 1.0, 0.8, 0.5, 0.3
    career_weight: float

    # Graph Traversal Metrics
    prerequisite_depth: int
    is_prerequisite_met: bool
    unsatisfied_prerequisites: List[str] = []
    transitive_prerequisites_count: int = 0
    downstream_skills_count: int = 0
    downstream_impact_score: float          # 0.0 - 1.0

    # Strategic Classifications
    is_bottleneck: bool
    is_foundation: bool
    readiness_state: str                    # TARGET_REACHED, NEAR_TARGET, LEARNING, READY_TO_START, FOUNDATION_REQUIRED, NOT_READY
    gap_category: str                       # CRITICAL, HIGH, MODERATE, LOW, NONE
    intelligent_priority_score: float       # 0.0 - 1.0

    # Grounded Pedagogical Explanation
    explanation: str

class NextBestSkillResponse(BaseModel):
    skill_id: str
    skill_slug: str
    skill_name: str
    category: str
    domain: str
    difficulty: str
    priority_score: float
    is_bottleneck: bool
    readiness_state: str
    reason: str
    prerequisites_met: bool
    recommended_resource_id: Optional[str] = None
    recommended_resource_title: Optional[str] = None

class CareerReadinessSummaryResponse(BaseModel):
    career_id: Optional[str] = None
    career_slug: Optional[str] = None
    career_name: str
    career_readiness_score: float           # 0.0 - 100.0%
    confidence_score: float                 # 0.0 - 100.0%
    is_cold_start: bool = False
    
    # Counts
    required_skills_count: int
    covered_skills_count: int
    partial_skills_count: int
    missing_skills_count: int
    critical_gaps_count: int
    blocked_skills_count: int

    # Lists
    strongest_skills: List[str] = []
    biggest_gaps: List[IntelligentSkillGapResponse] = []
    bottlenecks: List[IntelligentSkillGapResponse] = []
    next_best_skill: Optional[NextBestSkillResponse] = None
    skill_gaps: List[IntelligentSkillGapResponse] = []

class GraphValidationResponse(BaseModel):
    is_valid: bool
    total_skills: int
    total_edges: int
    cycles_detected: List[List[str]] = []
    orphan_skills: List[str] = []
    missing_references: List[str] = []
    duplicate_edges: List[str] = []
    inactive_skills: List[str] = []
