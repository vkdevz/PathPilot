"""Add adaptive learning engine tables

Revision ID: 0005_adaptive_learning_engine
Revises: 0004_skill_graph_intelligence
Create Date: 2026-08-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0005_adaptive_learning_engine'
down_revision: Union[str, None] = '0004_skill_graph_intelligence'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Create learner_evidence table
    op.create_table(
        'learner_evidence',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.String(length=36), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('evidence_type', sa.String(length=50), nullable=False),
        sa.Column('source_id', sa.String(length=100), nullable=True),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('raw_score', sa.Float(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=False, server_default='0.8'),
        sa.Column('weight', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('dedup_hash', sa.String(length=64), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())
    )
    op.create_index(op.f('ix_learner_evidence_user_id'), 'learner_evidence', ['user_id'], unique=False)
    op.create_index(op.f('ix_learner_evidence_skill_id'), 'learner_evidence', ['skill_id'], unique=False)
    op.create_index(op.f('ix_learner_evidence_evidence_type'), 'learner_evidence', ['evidence_type'], unique=False)
    op.create_index(op.f('ix_learner_evidence_dedup_hash'), 'learner_evidence', ['dedup_hash'], unique=True)

    # 2. Create learner_state_history table
    op.create_table(
        'learner_state_history',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.String(length=36), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('proficiency', sa.Float(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('mastery_state', sa.String(length=50), nullable=False, server_default='NOT_STARTED'),
        sa.Column('struggle_state', sa.String(length=50), nullable=False, server_default='NORMAL'),
        sa.Column('learning_pace', sa.String(length=50), nullable=False, server_default='NORMAL'),
        sa.Column('algorithm_version', sa.String(length=50), nullable=False, server_default='adaptive-v1.0'),
        sa.Column('trigger_event', sa.String(length=100), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())
    )
    op.create_index(op.f('ix_learner_state_history_user_id'), 'learner_state_history', ['user_id'], unique=False)
    op.create_index(op.f('ix_learner_state_history_skill_id'), 'learner_state_history', ['skill_id'], unique=False)

    # 3. Create adaptation_events table
    op.create_table(
        'adaptation_events',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.String(length=36), sa.ForeignKey('skills.id', ondelete='SET NULL'), nullable=True),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('trigger', sa.String(length=100), nullable=False),
        sa.Column('previous_state', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('new_state', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('algorithm_version', sa.String(length=50), nullable=False, server_default='adaptive-v1.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())
    )
    op.create_index(op.f('ix_adaptation_events_user_id'), 'adaptation_events', ['user_id'], unique=False)
    op.create_index(op.f('ix_adaptation_events_skill_id'), 'adaptation_events', ['skill_id'], unique=False)
    op.create_index(op.f('ix_adaptation_events_event_type'), 'adaptation_events', ['event_type'], unique=False)

    # 4. Create roadmap_versions table
    op.create_table(
        'roadmap_versions',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('learning_path_id', sa.String(length=36), sa.ForeignKey('learning_paths.id', ondelete='CASCADE'), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('adaptation_event_id', sa.String(length=36), sa.ForeignKey('adaptation_events.id', ondelete='SET NULL'), nullable=True),
        sa.Column('milestones_snapshot', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())
    )
    op.create_index(op.f('ix_roadmap_versions_user_id'), 'roadmap_versions', ['user_id'], unique=False)
    op.create_index(op.f('ix_roadmap_versions_learning_path_id'), 'roadmap_versions', ['learning_path_id'], unique=False)

def downgrade() -> None:
    op.drop_table('roadmap_versions')
    op.drop_table('adaptation_events')
    op.drop_table('learner_state_history')
    op.drop_table('learner_evidence')
