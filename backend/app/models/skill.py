from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class Skill(Base, TimestampMixin):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, index=True, nullable=False)  # e.g., 'python-ds'
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)                       # Foundation, Core Skills, Advanced Skills, Industry Readiness
    domain = Column(String(100), default="General", nullable=False, index=True) # Data & Analytics, AI & Emerging Tech, Software Engineering, etc.
    difficulty = Column(String(50), default="Beginner")                  # Beginner, Intermediate, Advanced
    level = Column(Integer, default=1, nullable=False)
    description = Column(Text, nullable=False)
    estimated_minutes = Column(Integer, default=90, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    metadata_json = Column(JSON, default=dict)

    # Relationships
    career_associations = relationship("CareerSkill", back_populates="skill", cascade="all, delete-orphan")
    resource_associations = relationship("ResourceSkill", back_populates="skill", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="skill", cascade="all, delete-orphan")
    learner_skills = relationship("LearnerSkill", back_populates="skill", cascade="all, delete-orphan")
    learning_path_items = relationship("LearningPathItem", back_populates="skill")

    # Self-referential prerequisites
    prerequisites = relationship(
        "SkillPrerequisite",
        foreign_keys="SkillPrerequisite.skill_id",
        back_populates="target_skill",
        cascade="all, delete-orphan"
    )
    downstream_skills = relationship(
        "SkillPrerequisite",
        foreign_keys="SkillPrerequisite.prerequisite_skill_id",
        back_populates="prerequisite_skill",
        cascade="all, delete-orphan"
    )

class SkillPrerequisite(Base, TimestampMixin):
    __tablename__ = "skill_prerequisites"

    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    prerequisite_skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    relationship_type = Column(String(50), default="prerequisite", nullable=False) # prerequisite, related, corequisite
    strength = Column(Float, default=1.0, nullable=False)                         # 0.0 - 1.0 dependency strength
    is_mandatory = Column(Boolean, default=True, nullable=False)

    # Relationships
    target_skill = relationship("Skill", foreign_keys=[skill_id], back_populates="prerequisites")
    prerequisite_skill = relationship("Skill", foreign_keys=[prerequisite_skill_id], back_populates="downstream_skills")

class LearnerSkill(Base, TimestampMixin):
    __tablename__ = "learner_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, default=0.0, nullable=False)                   # 0 - 100 percentage (backward compatible)
    proficiency = Column(Float, default=0.0, nullable=False)             # 0.0 - 1.0 normalized internal proficiency
    confidence = Column(Float, default=0.5, nullable=False)              # 0.0 - 1.0 confidence score based on evidence source
    evidence_source = Column(String(50), default="self_report", nullable=False) # assessment, verified_practice, completed_resource, self_report, inferred
    assessment_score = Column(Float, nullable=True)                      # 0 - 100 verified diagnostic score
    self_reported_score = Column(Float, nullable=True)                  # 0 - 100 self-reported baseline score
    status = Column(String(50), default="locked", nullable=False)        # locked, available, in_progress, mastered
    last_assessed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="learner_skills")
    skill = relationship("Skill", back_populates="learner_skills")

