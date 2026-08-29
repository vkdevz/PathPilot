from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class Feedback(Base, TimestampMixin):
    __tablename__ = "feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    learning_path_item_id = Column(String(36), ForeignKey("learning_path_items.id", ondelete="CASCADE"), nullable=True, index=True)
    feedback_type = Column(String(50), nullable=False)                  # too_easy, too_hard, useful, not_useful, irrelevant
    notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="feedback_records")
    learning_path_item = relationship("LearningPathItem", back_populates="feedback_entries")
