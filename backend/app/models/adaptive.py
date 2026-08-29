from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, JSON, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class LearnerEvidence(Base, TimestampMixin):
    """
    Standardized, verifiable evidence record of learner activity and performance.
    Guarantees idempotency via SHA-256 deduplication hashing.
    """
    __tablename__ = "learner_evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Evidence category: ASSESSMENT, QUIZ, PROJECT, RESOURCE_COMPLETION, SELF_REPORT, FEEDBACK, REPEATED_PERFORMANCE
    evidence_type = Column(String(50), nullable=False, index=True)
    source_id = Column(String(100), nullable=True) # e.g. attempt_id, resource_id, feedback_id
    
    score = Column(Float, nullable=False) # Normalized 0.0 - 1.0
    raw_score = Column(Float, nullable=True) # Raw score e.g. 85.0%
    confidence = Column(Float, default=0.8, nullable=False) # 0.0 - 1.0 epistemic certainty
    weight = Column(Float, default=1.0, nullable=False) # Derived reliability weight
    
    dedup_hash = Column(String(64), unique=True, index=True, nullable=True) # SHA-256 idempotency key
    metadata_json = Column(JSON, default=dict, nullable=False)

    # Relationships
    user = relationship("User", backref="evidence_records")
    skill = relationship("Skill")


class LearnerStateHistory(Base, TimestampMixin):
    """
    Temporal audit trail tracking skill proficiency and confidence evolution.
    Preserves historical progression for time-series analysis and XAI explanations.
    """
    __tablename__ = "learner_state_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    
    proficiency = Column(Float, nullable=False) # 0.0 - 1.0
    confidence = Column(Float, nullable=False) # 0.0 - 1.0
    mastery_state = Column(String(50), default="NOT_STARTED", nullable=False) # NOT_STARTED, DEVELOPING, PRACTICING, NEAR_MASTERY, MASTERED
    struggle_state = Column(String(50), default="NORMAL", nullable=False) # NORMAL, AT_RISK, STRUGGLING, SEVERELY_STRUGGLING
    learning_pace = Column(String(50), default="NORMAL", nullable=False) # FAST, NORMAL, SLOW, UNKNOWN
    
    algorithm_version = Column(String(50), default="adaptive-v1.0", nullable=False)
    trigger_event = Column(String(100), nullable=True)
    metadata_json = Column(JSON, default=dict, nullable=False)

    # Relationships
    user = relationship("User", backref="state_histories")
    skill = relationship("Skill")


class AdaptationEvent(Base, TimestampMixin):
    """
    First-class, auditable record of an adaptation trigger and resultant state mutation.
    Powers the XAI dashboard and AI Mentor pedagogical explanations.
    """
    __tablename__ = "adaptation_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # SKILL_UPDATED, MASTERY_DETECTED, STRUGGLE_DETECTED, DIFFICULTY_CHANGED, ROADMAP_CHANGED, RECOMMENDATIONS_REGENERATED, INTERVENTION_TRIGGERED, GOAL_CHANGED
    event_type = Column(String(50), nullable=False, index=True)
    trigger = Column(String(100), nullable=False) # e.g. "AssessmentCompleted:stats-ds", "RepeatedFailure:ml-foundations"
    
    previous_state = Column(JSON, default=dict, nullable=False)
    new_state = Column(JSON, default=dict, nullable=False)
    reason = Column(Text, nullable=False)
    
    algorithm_version = Column(String(50), default="adaptive-v1.0", nullable=False)

    # Relationships
    user = relationship("User", backref="adaptation_events")
    skill = relationship("Skill")


class RoadmapVersion(Base, TimestampMixin):
    """
    Version-controlled snapshot of a learner's personalized learning roadmap.
    Enables diffing historical progression without destructive in-place overwrites.
    """
    __tablename__ = "roadmap_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    learning_path_id = Column(String(36), ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=False, index=True)
    
    version_number = Column(Integer, default=1, nullable=False)
    adaptation_event_id = Column(String(36), ForeignKey("adaptation_events.id", ondelete="SET NULL"), nullable=True)
    
    milestones_snapshot = Column(JSON, default=list, nullable=False) # Serialized list of milestone objects
    reason = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    user = relationship("User", backref="roadmap_versions")
    learning_path = relationship("LearningPath", backref="versions")
    adaptation_event = relationship("AdaptationEvent")
