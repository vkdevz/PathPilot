import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.retrieval_service import RetrievalService

@pytest.mark.asyncio
async def test_semantic_search_resources(db_session: AsyncSession):
    service = RetrievalService(db_session)

    # Search Python / Data Science
    results = await service.search_resources(
        query="Python programming data analysis statistics and pandas",
        limit=5
    )

    assert len(results) > 0
    top_result = results[0]
    assert "slug" in top_result
    assert "title" in top_result
    assert "similarity_score" in top_result
    assert top_result["similarity_score"] > 0.3
    assert "skills_taught" in top_result
    assert "reasons" in top_result

@pytest.mark.asyncio
async def test_semantic_search_with_metadata_filters(db_session: AsyncSession):
    service = RetrievalService(db_session)

    # Search with difficulty filter
    beginner_results = await service.search_resources(
        query="machine learning and deep learning",
        difficulties=["Beginner"],
        limit=5
    )
    for r in beginner_results:
        assert r["difficulty"] == "Beginner"

    # Search with resource_type filter
    project_results = await service.search_resources(
        query="web development and fastapi",
        resource_types=["project", "practice"],
        limit=5
    )
    for r in project_results:
        assert r["resource_type"] in ("project", "practice")

@pytest.mark.asyncio
async def test_semantic_search_skills_and_careers(db_session: AsyncSession):
    service = RetrievalService(db_session)

    # Search skills
    skills = await service.search_skills(query="cloud devops terraform kubernetes", limit=3)
    assert len(skills) > 0
    top_skill = skills[0]
    assert "slug" in top_skill
    assert "category" in top_skill

    # Search careers
    careers = await service.search_careers(query="machine learning artificial intelligence engineer", limit=2)
    assert len(careers) > 0
    top_career = careers[0]
    assert top_career["slug"] in ("ai-engineer", "data-scientist")

@pytest.mark.asyncio
async def test_find_resources_by_skill(db_session: AsyncSession):
    service = RetrievalService(db_session)

    resources = await service.find_resources_by_skill(skill_identifier="python-ds", limit=3)
    assert len(resources) > 0
    assert resources[0]["target_skill_slug"] == "python-ds"
