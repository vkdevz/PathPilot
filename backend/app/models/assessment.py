from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class Assessment(Base, TimestampMixin):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    total_questions = Column(Integer, default=5, nullable=False)
    passing_score = Column(Float, default=70.0, nullable=False)

    # Relationships
    career = relationship("Career", back_populates="assessments")
    questions = relationship("Question", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")

class Question(Base, TimestampMixin):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=True, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    difficulty = Column(String(50), default="Beginner")
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)                      # ["Option A", "Option B", "Option C", "Option D"]
    correct_answer_index = Column(Integer, nullable=False)      # 0, 1, 2, 3
    explanation = Column(Text, nullable=True)

    # Relationships
    assessment = relationship("Assessment", back_populates="questions")
    skill = relationship("Skill", back_populates="questions")

class AssessmentAttempt(Base, TimestampMixin):
    __tablename__ = "assessment_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    overall_score = Column(Float, nullable=False)
    topic_breakdown = Column(JSON, nullable=False)              # [{"skill_id": "...", "score": 85.0, "level": "strong"}]
    submitted_answers = Column(JSON, nullable=False)            # [{"question_id": "...", "selected": 2, "is_correct": true}]
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="assessment_attempts")
    assessment = relationship("Assessment", back_populates="attempts")
