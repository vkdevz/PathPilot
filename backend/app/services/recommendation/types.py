from dataclasses import dataclass, field
from typing import List, Dict, Set, Optional, Any
from app.models.resource import Resource
from app.models.skill import Skill
from app.models.career import Career

@dataclass
class SkillGapInfo:
    skill_id: str
    skill_slug: str
    skill_name: str
    category: str
    difficulty: str
    level: int
    current_score: float         # 0 - 100
    target_score: float = 85.0   # industry benchmark
    career_weight: float = 0.2   # importance to career
    is_prerequisite_met: bool = True
    unsatisfied_prerequisites: List[str] = field(default_factory=list)
    is_bottleneck: bool = False
    intelligent_priority_score: float = 0.0
    readiness_state: str = "READY_TO_START"
    gap_category: str = "MODERATE"
    downstream_impact_score: float = 0.0

    @property
    def gap_magnitude(self) -> float:
        """Percentage gap from current score to target score (0 to 100)."""
        return max(0.0, self.target_score - self.current_score)

    @property
    def priority_score(self) -> float:
        """Intelligent graph-aware priority score."""
        if self.intelligent_priority_score > 0.0:
            return self.intelligent_priority_score
        base = (self.gap_magnitude / 100.0) * self.career_weight
        return base if self.is_prerequisite_met else (base * 0.2)

@dataclass
class LearnerState:
    user_id: str
    display_name: str
    email: str
    experience_level: str        # beginner, intermediate, advanced
    learning_pace: str           # casual (10m), moderate (20m), intensive (45m)
    preferred_format: str        # interactive, video, reading, projects
    weekly_hours_goal: int
    xp: int
    streak_days: int
    
    target_career: Optional[Career] = None
    target_career_name: str = "Technology Specialist"
    
    # Assessed skills & gaps
    learner_skills_map: Dict[str, float] = field(default_factory=dict) # skill_id -> score
    skill_gaps: List[SkillGapInfo] = field(default_factory=list)
    unlocked_gap_skill_ids: Set[str] = field(default_factory=set)
    blocked_gap_skill_ids: Set[str] = field(default_factory=set)
    bottleneck_skill_ids: Set[str] = field(default_factory=set)
    mastered_skill_ids: Set[str] = field(default_factory=set)
    next_best_skill_id: Optional[str] = None
    career_readiness_pct: float = 0.0
    confidence_pct: float = 50.0
    is_cold_start: bool = False
    
    # Active Roadmap
    active_path_id: Optional[str] = None
    active_milestone_skill_id: Optional[str] = None
    active_milestone_skill_name: Optional[str] = None
    active_milestone_step: Optional[int] = None
    roadmap_skill_order: List[str] = field(default_factory=list) # ordered skill_ids
    
    # History & Feedback
    completed_resource_ids: Set[str] = field(default_factory=set)
    completed_resource_types: List[str] = field(default_factory=list)
    recent_study_minutes: int = 0
    feedback_history: List[Dict[str, Any]] = field(default_factory=list)
    disliked_formats: Set[str] = field(default_factory=set)
    liked_formats: Set[str] = field(default_factory=set)

@dataclass
class CandidateResource:
    resource: Resource
    channels: List[str] = field(default_factory=list) # "skill_gap", "active_milestone", "semantic", "exploration"
    semantic_similarity: float = 0.0
    primary_target_skill: Optional[Skill] = None

@dataclass
class ScoredCandidate:
    candidate: CandidateResource
    
    # 8-Dimensional Normalized Feature Vector [0.0 - 1.0]
    skill_gap_score: float = 0.0
    career_alignment_score: float = 0.0
    roadmap_affinity_score: float = 0.0
    semantic_similarity_score: float = 0.0
    difficulty_fit_score: float = 0.0
    format_fit_score: float = 0.0
    pacing_fit_score: float = 0.0
    feedback_fit_score: float = 0.0
    
    # Composite Score in [0, 100]
    composite_score: float = 0.0
    
    # Diversity & Ranking
    mmr_score: float = 0.0
    match_tier: str = "Recommended"
    explanation_reasons: List[str] = field(default_factory=list)
