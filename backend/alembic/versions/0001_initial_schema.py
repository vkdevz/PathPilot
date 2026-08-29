"""Initial PathPilot 2.0 PostgreSQL Schema Migration

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-08-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Enable pgvector extension if on PostgreSQL
    try:
        op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    except Exception:
        pass

    # 2. Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('display_name', sa.String(length=255), nullable=True),
        sa.Column('avatar_url', sa.String(length=512), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 3. Create careers table
    op.create_table(
        'careers',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('market_demand_score', sa.Integer(), nullable=True),
        sa.Column('salary_range', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_careers_slug'), 'careers', ['slug'], unique=True)
    op.create_index(op.f('ix_careers_category'), 'careers', ['category'], unique=False)

    # 4. Create skills table
    op.create_table(
        'skills',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('difficulty', sa.String(length=50), nullable=True),
        sa.Column('level', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('estimated_minutes', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skills_slug'), 'skills', ['slug'], unique=True)

    # 5. Create skill_prerequisites table
    op.create_table(
        'skill_prerequisites',
        sa.Column('skill_id', sa.String(length=36), nullable=False),
        sa.Column('prerequisite_skill_id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['prerequisite_skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('skill_id', 'prerequisite_skill_id')
    )

    # 6. Create career_skills table
    op.create_table(
        'career_skills',
        sa.Column('career_id', sa.String(length=36), nullable=False),
        sa.Column('skill_id', sa.String(length=36), nullable=False),
        sa.Column('weight', sa.Float(), nullable=False),
        sa.Column('is_mandatory', sa.Boolean(), nullable=False),
        sa.Column('recommended_order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['career_id'], ['careers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('career_id', 'skill_id')
    )

    # 7. Create resources table
    op.create_table(
        'resources',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=False),
        sa.Column('url', sa.String(length=512), nullable=True),
        sa.Column('difficulty', sa.String(length=50), nullable=False),
        sa.Column('estimated_minutes', sa.Integer(), nullable=False),
        sa.Column('provider', sa.String(length=100), nullable=True),
        sa.Column('is_interactive', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resources_slug'), 'resources', ['slug'], unique=True)
    op.create_index(op.f('ix_resources_resource_type'), 'resources', ['resource_type'], unique=False)

    # 8. Create resource_skills table
    op.create_table(
        'resource_skills',
        sa.Column('resource_id', sa.String(length=36), nullable=False),
        sa.Column('skill_id', sa.String(length=36), nullable=False),
        sa.Column('relevance_score', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['resource_id'], ['resources.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('resource_id', 'skill_id')
    )

    # 9. Create learner_profiles table
    op.create_table(
        'learner_profiles',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('target_career_id', sa.String(length=36), nullable=True),
        sa.Column('experience_level', sa.String(length=50), nullable=True),
        sa.Column('learning_pace', sa.String(length=50), nullable=True),
        sa.Column('preferred_format', sa.String(length=50), nullable=True),
        sa.Column('weekly_hours_goal', sa.Integer(), nullable=True),
        sa.Column('xp', sa.Integer(), nullable=False),
        sa.Column('streak_days', sa.Integer(), nullable=False),
        sa.Column('preferences', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['target_career_id'], ['careers.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learner_profiles_user_id'), 'learner_profiles', ['user_id'], unique=True)

    # 10. Create learner_skills table
    op.create_table(
        'learner_skills',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('skill_id', sa.String(length=36), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('last_assessed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learner_skills_user_id'), 'learner_skills', ['user_id'], unique=False)
    op.create_index(op.f('ix_learner_skills_skill_id'), 'learner_skills', ['skill_id'], unique=False)

    # 11. Create assessments table
    op.create_table(
        'assessments',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('career_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('total_questions', sa.Integer(), nullable=False),
        sa.Column('passing_score', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['career_id'], ['careers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assessments_career_id'), 'assessments', ['career_id'], unique=False)

    # 12. Create questions table
    op.create_table(
        'questions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('assessment_id', sa.String(length=36), nullable=True),
        sa.Column('skill_id', sa.String(length=36), nullable=False),
        sa.Column('difficulty', sa.String(length=50), nullable=True),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('options', sa.JSON(), nullable=False),
        sa.Column('correct_answer_index', sa.Integer(), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_questions_assessment_id'), 'questions', ['assessment_id'], unique=False)
    op.create_index(op.f('ix_questions_skill_id'), 'questions', ['skill_id'], unique=False)

    # 13. Create assessment_attempts table
    op.create_table(
        'assessment_attempts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('assessment_id', sa.String(length=36), nullable=False),
        sa.Column('overall_score', sa.Float(), nullable=False),
        sa.Column('topic_breakdown', sa.JSON(), nullable=False),
        sa.Column('submitted_answers', sa.JSON(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assessment_attempts_user_id'), 'assessment_attempts', ['user_id'], unique=False)

    # 14. Create learning_paths table
    op.create_table(
        'learning_paths',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('career_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['career_id'], ['careers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learning_paths_user_id'), 'learning_paths', ['user_id'], unique=False)

    # 15. Create learning_path_items table
    op.create_table(
        'learning_path_items',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('learning_path_id', sa.String(length=36), nullable=False),
        sa.Column('skill_id', sa.String(length=36), nullable=False),
        sa.Column('resource_id', sa.String(length=36), nullable=True),
        sa.Column('step_order', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('recommendation_reason', sa.Text(), nullable=True),
        sa.Column('estimated_hours', sa.Integer(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['learning_path_id'], ['learning_paths.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['resource_id'], ['resources.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learning_path_items_learning_path_id'), 'learning_path_items', ['learning_path_id'], unique=False)

    # 16. Create progress table
    op.create_table(
        'progress',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('resource_id', sa.String(length=36), nullable=False),
        sa.Column('time_spent_minutes', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['resource_id'], ['resources.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_progress_user_id'), 'progress', ['user_id'], unique=False)

    # 17. Create feedback table
    op.create_table(
        'feedback',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('learning_path_item_id', sa.String(length=36), nullable=True),
        sa.Column('feedback_type', sa.String(length=50), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['learning_path_item_id'], ['learning_path_items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_feedback_user_id'), 'feedback', ['user_id'], unique=False)

    # 18. Create conversations & messages table
    op.create_table(
        'conversations',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_user_id'), 'conversations', ['user_id'], unique=False)

    op.create_table(
        'messages',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('conversation_id', sa.String(length=36), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tool_calls', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_messages_conversation_id'), 'messages', ['conversation_id'], unique=False)

def downgrade() -> None:
    op.drop_table('messages')
    op.drop_table('conversations')
    op.drop_table('feedback')
    op.drop_table('progress')
    op.drop_table('learning_path_items')
    op.drop_table('learning_paths')
    op.drop_table('assessment_attempts')
    op.drop_table('questions')
    op.drop_table('assessments')
    op.drop_table('learner_skills')
    op.drop_table('learner_profiles')
    op.drop_table('resource_skills')
    op.drop_table('resources')
    op.drop_table('career_skills')
    op.drop_table('skill_prerequisites')
    op.drop_table('skills')
    op.drop_table('careers')
    op.drop_table('users')
