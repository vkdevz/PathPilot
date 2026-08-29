from sqlalchemy import Column, String, Integer, Float, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class Career(Base, TimestampMixin):
    __tablename__ = "careers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, index=True, nullable=False)  # e.g., 'data-scientist'
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)          # e.g., 'Data & Analytics'
    description = Column(Text, nullable=False)
    icon = Column(String(50), default="🎯")
    market_demand_score = Column(Integer, default=90)                   # e.g., 94 (%)
    salary_range = Column(String(100), default="$100k - $150k")

    # Relationships
    career_skills = relationship("CareerSkill", back_populates="career", cascade="all, delete-orphan")
    learner_profiles = relationship("LearnerProfile", back_populates="target_career")
    assessments = relationship("Assessment", back_populates="career", cascade="all, delete-orphan")
    learning_paths = relationship("LearningPath", back_populates="career")

class CareerSkill(Base, TimestampMixin):
    __tablename__ = "career_skills"

    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), primary_key=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    weight = Column(Float, default=1.0, nullable=False)
    importance = Column(String(50), default="high", nullable=False)     # critical, high, medium, low
    target_proficiency = Column(Float, default=0.85, nullable=False)    # 0.0 - 1.0 target benchmark
    is_mandatory = Column(Boolean, default=True, nullable=False)
    recommended_order = Column(Integer, default=1, nullable=False)

    # Relationships
    career = relationship("Career", back_populates="career_skills")
    skill = relationship("Skill", back_populates="career_associations")

