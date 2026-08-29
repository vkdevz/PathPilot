"""Add skill graph intelligence columns and metadata

Revision ID: 0004_skill_graph_intelligence
Revises: 0003_recommendations_persistence
Create Date: 2026-08-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0004_skill_graph_intelligence'
down_revision: Union[str, None] = '0003_recommendations_persistence'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Update skills table
    op.add_column('skills', sa.Column('domain', sa.String(length=100), nullable=False, server_default='General'))
    op.add_column('skills', sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column('skills', sa.Column('metadata_json', sa.JSON(), nullable=True))
    op.create_index(op.f('ix_skills_domain'), 'skills', ['domain'], unique=False)

    # 2. Update skill_prerequisites table
    op.add_column('skill_prerequisites', sa.Column('relationship_type', sa.String(length=50), nullable=False, server_default='prerequisite'))
    op.add_column('skill_prerequisites', sa.Column('strength', sa.Float(), nullable=False, server_default='1.0'))
    op.add_column('skill_prerequisites', sa.Column('is_mandatory', sa.Boolean(), nullable=False, server_default=sa.true()))

    # 3. Update career_skills table
    op.add_column('career_skills', sa.Column('importance', sa.String(length=50), nullable=False, server_default='high'))
    op.add_column('career_skills', sa.Column('target_proficiency', sa.Float(), nullable=False, server_default='0.85'))

    # 4. Update learner_skills table
    op.add_column('learner_skills', sa.Column('proficiency', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('learner_skills', sa.Column('confidence', sa.Float(), nullable=False, server_default='0.5'))
    op.add_column('learner_skills', sa.Column('evidence_source', sa.String(length=50), nullable=False, server_default='self_report'))
    op.add_column('learner_skills', sa.Column('assessment_score', sa.Float(), nullable=True))
    op.add_column('learner_skills', sa.Column('self_reported_score', sa.Float(), nullable=True))

    # 5. Update resource_skills table
    op.add_column('resource_skills', sa.Column('relation_type', sa.String(length=50), nullable=False, server_default='teaches'))
    op.add_column('resource_skills', sa.Column('is_primary', sa.Boolean(), nullable=False, server_default=sa.true()))

def downgrade() -> None:
    # 5. Downgrade resource_skills
    op.drop_column('resource_skills', 'is_primary')
    op.drop_column('resource_skills', 'relation_type')

    # 4. Downgrade learner_skills
    op.drop_column('learner_skills', 'self_reported_score')
    op.drop_column('learner_skills', 'assessment_score')
    op.drop_column('learner_skills', 'evidence_source')
    op.drop_column('learner_skills', 'confidence')
    op.drop_column('learner_skills', 'proficiency')

    # 3. Downgrade career_skills
    op.drop_column('career_skills', 'target_proficiency')
    op.drop_column('career_skills', 'importance')

    # 2. Downgrade skill_prerequisites
    op.drop_column('skill_prerequisites', 'is_mandatory')
    op.drop_column('skill_prerequisites', 'strength')
    op.drop_column('skill_prerequisites', 'relationship_type')

    # 1. Downgrade skills
    op.drop_index(op.f('ix_skills_domain'), table_name='skills')
    op.drop_column('skills', 'metadata_json')
    op.drop_column('skills', 'is_active')
    op.drop_column('skills', 'domain')
