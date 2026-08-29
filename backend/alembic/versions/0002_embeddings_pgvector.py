"""Add pgvector extension and embeddings table

Revision ID: 0002_embeddings_pgvector
Revises: 0001_initial_schema
Create Date: 2026-08-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0002_embeddings_pgvector'
down_revision: Union[str, None] = '0001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Enable pgvector extension if on PostgreSQL
    try:
        op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    except Exception:
        pass

    # 2. Check if pgvector is available for column type, else fallback to JSON
    try:
        from pgvector.sqlalchemy import Vector
        vector_col = Vector(1536)
    except Exception:
        vector_col = sa.JSON()

    # 3. Create embeddings table
    op.create_table(
        'embeddings',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=False),
        sa.Column('entity_id', sa.String(length=36), nullable=False),
        sa.Column('embedding', vector_col, nullable=True),
        sa.Column('content_hash', sa.String(length=64), nullable=True),
        sa.Column('model_name', sa.String(length=100), nullable=False, server_default="text-embedding-3-small"),
        sa.Column('dimensions', sa.Integer(), nullable=False, server_default="1536"),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('entity_type', 'entity_id', name='uq_entity_type_entity_id')
    )
    op.create_index(op.f('ix_embeddings_entity_type'), 'embeddings', ['entity_type'], unique=False)
    op.create_index(op.f('ix_embeddings_entity_id'), 'embeddings', ['entity_id'], unique=False)
    op.create_index('ix_embeddings_entity_lookup', 'embeddings', ['entity_type', 'entity_id'], unique=False)

    # 4. Attempt to create vector cosine index if pgvector is enabled
    try:
        op.execute("CREATE INDEX IF NOT EXISTS ix_embeddings_embedding_cosine ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);")
    except Exception:
        pass

def downgrade() -> None:
    op.drop_index('ix_embeddings_entity_lookup', table_name='embeddings')
    op.drop_index(op.f('ix_embeddings_entity_id'), table_name='embeddings')
    op.drop_index(op.f('ix_embeddings_entity_type'), table_name='embeddings')
    op.drop_table('embeddings')
