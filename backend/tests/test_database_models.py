import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.career import Career
from app.models.skill import Skill, SkillPrerequisite
from app.models.resource import Resource
from app.models.assessment import Assessment, Question

@pytest.mark.asyncio
async def test_seed_integrity(db_session: AsyncSession):
    """
    Verifies that seed data populates careers, skills, resources, and questions.
    """
    # 1. Careers exist
    res_careers = await db_session.execute(select(Career))
    careers = list(res_careers.scalars().all())
    assert len(careers) >= 6

    # 2. Skills exist and have prerequisite relationships
    res_skills = await db_session.execute(select(Skill))
    skills = list(res_skills.scalars().all())
    assert len(skills) >= 15

    res_prereqs = await db_session.execute(select(SkillPrerequisite))
    prereqs = list(res_prereqs.scalars().all())
    assert len(prereqs) > 0

    # 3. Resources of multiple types exist
    res_resources = await db_session.execute(select(Resource))
    resources = list(res_resources.scalars().all())
    assert len(resources) >= 8
    types = {r.resource_type for r in resources}
    assert "course" in types
    assert "project" in types
    assert "practice" in types

    # 4. Questions exist
    res_questions = await db_session.execute(select(Question))
    questions = list(res_questions.scalars().all())
    assert len(questions) >= 10
