from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class StudySession(Base, TimestampMixin):
    """
    Manually logged study session representing continuous learner effort.
    Independent from verified resource completion.
    """
    __tablename__ = "study_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("resources.id", ondelete="SET NULL"), nullable=True, index=True)
    topic = Column(String(255), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    session_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    notes = Column(Text, nullable=True)
    xp_earned = Column(Integer, default=0, nullable=False)

    # Relationships
    user = relationship("User", back_populates="study_sessions")
    resource = relationship("Resource", backref="study_sessions")


class Progress(Base, TimestampMixin):
    """
    Verified learning progress and resource completion record.
    """
    __tablename__ = "progress"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    time_spent_minutes = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="started", nullable=False)       # started, in_progress, completed
    completed_at = Column(DateTime(timezone=True), nullable=True)
    xp_earned = Column(Integer, default=50, nullable=False)

    # Relationships
    user = relationship("User", back_populates="progress_logs")
    resource = relationship("Resource", back_populates="progress_logs")
