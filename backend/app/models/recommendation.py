from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class RecommendationLog(Base, TimestampMixin):
    """
    Persisted telemetry record of a recommendation engine execution for a learner.
    Allows offline evaluation, conversion tracking, and algorithmic auditing.
    """
    __tablename__ = "recommendation_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_career_id = Column(String(36), ForeignKey("careers.id", ondelete="SET NULL"), nullable=True)
    
    algorithm_version = Column(String(50), default="hybrid-v2.0", nullable=False)
    top_resource_id = Column(String(36), ForeignKey("resources.id", ondelete="SET NULL"), nullable=True)
    recommended_resource_ids = Column(JSON, default=list, nullable=False) # List of UUID strings
    
    # Feature scores and sub-component contributions
    feature_scores = Column(JSON, default=dict, nullable=False) # {resource_id: {gap: 0.9, career: 0.8, ...}}
    
    # Algorithmic telemetry
    total_candidates_generated = Column(Integer, default=0, nullable=False)
    candidates_after_filter = Column(Integer, default=0, nullable=False)
    intra_list_diversity = Column(Float, default=0.0, nullable=False)
    latency_ms = Column(Float, default=0.0, nullable=False)
    
    context_snapshot = Column(JSON, default=dict, nullable=False) # Snapshot of learner skill gaps & active milestone

    # Relationships
    user = relationship("User", backref="recommendation_logs")
    target_career = relationship("Career")
    top_resource = relationship("Resource")

class RecommendationFeedback(Base, TimestampMixin):
    """
    Explicit learner feedback and interaction telemetry on recommended resources.
    """
    __tablename__ = "recommendation_feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_log_id = Column(String(36), ForeignKey("recommendation_logs.id", ondelete="SET NULL"), nullable=True)
    
    # Feedback action/type: started, completed, saved, dismissed, too_easy, too_hard, helpful, irrelevant
    feedback_type = Column(String(50), nullable=False)
    rating = Column(Integer, nullable=True) # 1-5 star rating
    notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", backref="recommendation_feedbacks")
    resource = relationship("Resource")
    recommendation_log = relationship("RecommendationLog", backref="feedbacks")
