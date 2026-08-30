from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class Resource(Base, TimestampMixin):
    __tablename__ = "resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    resource_type = Column(String(50), nullable=False, index=True)      # course, project, assessment, article, video, documentation, practice
    url = Column(String(512), nullable=True)
    difficulty = Column(String(50), default="Beginner", nullable=False) # Beginner, Intermediate, Advanced
    estimated_minutes = Column(Integer, default=60, nullable=False)
    provider = Column(String(100), default="PathPilot Academy")
    is_interactive = Column(Boolean, default=False)
    content = Column(Text, nullable=True)

    # Relationships
    resource_skills = relationship("ResourceSkill", back_populates="resource", cascade="all, delete-orphan")
    learning_path_items = relationship("LearningPathItem", back_populates="resource")
    progress_logs = relationship("Progress", back_populates="resource")

class ResourceSkill(Base, TimestampMixin):
    __tablename__ = "resource_skills"

    resource_id = Column(String(36), ForeignKey("resources.id", ondelete="CASCADE"), primary_key=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    relevance_score = Column(Float, default=1.0, nullable=False)
    relation_type = Column(String(50), default="teaches", nullable=False) # teaches, requires
    is_primary = Column(Boolean, default=True, nullable=False)

    # Relationships
    resource = relationship("Resource", back_populates="resource_skills")
    skill = relationship("Skill", back_populates="resource_associations")

