import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.skill import Skill

@pytest.mark.asyncio
async def test_api_get_adaptive_state(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/learners/me/state", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert "skills" in data
    assert "estimated_learning_pace" in data

@pytest.mark.asyncio
async def test_api_submit_evidence(client: AsyncClient, auth_headers: dict, db_session: AsyncSession):
    # Find a skill
    res = await db_session.execute(select(Skill))
    skill = res.scalars().first()
    assert skill is not None

    payload = {
        "skill_id": skill.id,
        "evidence_type": "ASSESSMENT",
        "score": 0.85,
        "raw_score": 85.0,
        "source_id": "api_test_001"
    }

    response = await client.post("/api/v1/learners/me/evidence", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "new_proficiency" in data

@pytest.mark.asyncio
async def test_api_feedback_nlp_interpretation(client: AsyncClient, auth_headers: dict):
    payload = {
        "comment": "This module was way too hard and confusing"
    }
    response = await client.post("/api/v1/learners/me/feedback/interpret", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["difficulty_signal"] == "TOO_HARD"
    assert data["sentiment"] == "NEGATIVE"

@pytest.mark.asyncio
async def test_api_get_timeline_and_history(client: AsyncClient, auth_headers: dict):
    t_res = await client.get("/api/v1/learners/me/adaptation/timeline", headers=auth_headers)
    assert t_res.status_code == 200
    assert isinstance(t_res.json(), list)

    p_res = await client.get("/api/v1/learners/me/progress-history", headers=auth_headers)
    assert p_res.status_code == 200
    assert isinstance(p_res.json(), list)

@pytest.mark.asyncio
async def test_api_run_benchmark(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/learners/me/adaptation/benchmark", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["accuracy_pct"] == 100.0
    assert data["total_scenarios"] == 15
