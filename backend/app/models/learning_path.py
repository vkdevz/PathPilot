from sqlalchemy import Column, String, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class LearningPath(Base, TimestampMixin):
    __tablename__ = "learning_paths"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="active", nullable=False)        # active, completed, archived

    # Relationships
    user = relationship("User", back_populates="learning_paths")
    career = relationship("Career", back_populates="learning_paths")
    items = relationship("LearningPathItem", back_populates="learning_path", cascade="all, delete-orphan", order_by="LearningPathItem.step_order")

class LearningPathItem(Base, TimestampMixin):
    __tablename__ = "learning_path_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    learning_path_id = Column(String(36), ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("resources.id", ondelete="SET NULL"), nullable=True)
    
    step_order = Column(Integer, nullable=False)
    status = Column(String(50), default="locked", nullable=False)        # locked, available, in_progress, completed, skipped
    recommendation_reason = Column(Text, nullable=True)
    estimated_hours = Column(Integer, default=2, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    learning_path = relationship("LearningPath", back_populates="items")
    skill = relationship("Skill", back_populates="learning_path_items")
    resource = relationship("Resource", back_populates="learning_path_items")
    feedback_entries = relationship("Feedback", back_populates="learning_path_item", cascade="all, delete-orphan")
