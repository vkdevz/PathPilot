from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class Progress(Base, TimestampMixin):
    __tablename__ = "progress"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    time_spent_minutes = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="started", nullable=False)       # started, in_progress, completed
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="progress_logs")
    resource = relationship("Resource", back_populates="progress_logs")
