from sqlalchemy import Column, String, Integer, JSON, UniqueConstraint, Index
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
    content_hash = Column(String(64), nullable=True)                     # SHA-256 hash of source entity text
    model_name = Column(String(100), default="text-embedding-3-small", nullable=False)
    dimensions = Column(Integer, default=1536, nullable=False)

    __table_args__ = (
        UniqueConstraint("entity_type", "entity_id", name="uq_entity_type_entity_id"),
        Index("ix_embeddings_entity_lookup", "entity_type", "entity_id"),
    )
