"""Add recommendation_logs and recommendation_feedback tables

Revision ID: 0003_recommendations_persistence
Revises: 0002_embeddings_pgvector
Create Date: 2026-08-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0003_recommendations_persistence'
down_revision: Union[str, None] = '0002_embeddings_pgvector'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Create recommendation_logs table
    op.create_table(
        'recommendation_logs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('target_career_id', sa.String(length=36), nullable=True),
        sa.Column('algorithm_version', sa.String(length=50), nullable=False, server_default='hybrid-v2.0'),
        sa.Column('top_resource_id', sa.String(length=36), nullable=True),
        sa.Column('recommended_resource_ids', sa.JSON(), nullable=False),
        sa.Column('feature_scores', sa.JSON(), nullable=False),
        sa.Column('total_candidates_generated', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('candidates_after_filter', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('intra_list_diversity', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('latency_ms', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('context_snapshot', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['target_career_id'], ['careers.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['top_resource_id'], ['resources.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recommendation_logs_user_id'), 'recommendation_logs', ['user_id'], unique=False)

    # 2. Create recommendation_feedback table
    op.create_table(
        'recommendation_feedback',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('resource_id', sa.String(length=36), nullable=False),
        sa.Column('recommendation_log_id', sa.String(length=36), nullable=True),
        sa.Column('feedback_type', sa.String(length=50), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['resource_id'], ['resources.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recommendation_log_id'], ['recommendation_logs.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recommendation_feedback_user_id'), 'recommendation_feedback', ['user_id'], unique=False)
    op.create_index(op.f('ix_recommendation_feedback_resource_id'), 'recommendation_feedback', ['resource_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_recommendation_feedback_resource_id'), table_name='recommendation_feedback')
    op.drop_index(op.f('ix_recommendation_feedback_user_id'), table_name='recommendation_feedback')
    op.drop_table('recommendation_feedback')

    op.drop_index(op.f('ix_recommendation_logs_user_id'), table_name='recommendation_logs')
    op.drop_table('recommendation_logs')
