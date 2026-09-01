from sqlalchemy import Column, String, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    display_name = Column(String(255), nullable=True, default="Learner")
    avatar_url = Column(String(512), nullable=True)
    role = Column(String(50), default="learner", nullable=False)

    # Relationships
    profile = relationship("LearnerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    learner_skills = relationship("LearnerSkill", back_populates="user", cascade="all, delete-orphan")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="user", cascade="all, delete-orphan")
    learning_paths = relationship("LearningPath", back_populates="user", cascade="all, delete-orphan")
    progress_logs = relationship("Progress", back_populates="user", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="user", cascade="all, delete-orphan")
    feedback_records = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")

class LearnerProfile(Base, TimestampMixin):
    __tablename__ = "learner_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    target_career_id = Column(String(36), ForeignKey("careers.id", ondelete="SET NULL"), nullable=True)

    experience_level = Column(String(50), default="beginner")  # beginner, intermediate, advanced
    learning_pace = Column(String(50), default="moderate")     # casual (10m), moderate (20m), intensive (45m)
    preferred_format = Column(String(50), default="interactive") # interactive, video, reading, projects
    weekly_hours_goal = Column(Integer, default=5)
    
    xp = Column(Integer, default=0, nullable=False)
    streak_days = Column(Integer, default=1, nullable=False)
    preferences = Column(JSON, default=dict)  # extra customizable preferences

    # Relationships
    user = relationship("User", back_populates="profile")
    target_career = relationship("Career", back_populates="learner_profiles", lazy="selectin")

    @property
    def target_career_name(self):
        try:
            if self.target_career:
                return self.target_career.name
        except Exception:
            pass
        return None
