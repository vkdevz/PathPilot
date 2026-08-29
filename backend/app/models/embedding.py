from sqlalchemy import Column, String, JSON
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid

# Attempt to import pgvector Vector type, otherwise fallback to JSON for SQLite tests
try:
    from pgvector.sqlalchemy import Vector
    VECTOR_TYPE = Vector(1536)
except (ImportError, Exception):
    VECTOR_TYPE = JSON

class Embedding(Base, TimestampMixin):
    __tablename__ = "embeddings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_type = Column(String(50), nullable=False, index=True)         # resource, skill, career, question
    entity_id = Column(String(36), nullable=False, index=True)
    embedding = Column(VECTOR_TYPE, nullable=True)                       # 1536-dimensional float vector
    content_hash = Column(String(64), nullable=True)
