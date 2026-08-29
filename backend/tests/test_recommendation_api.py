import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_personalized_recommendations_endpoint(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/recommendations?limit=5", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    first = data[0]
    assert "title" in first
    assert "relevance_score" in first
    assert "explanation_reasons" in first
    assert "feature_breakdown" in first
    assert first["feature_breakdown"]["skill_gap"] >= 0.0

@pytest.mark.asyncio
async def test_get_next_best_action_endpoint(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/recommendations/next-best-action", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "headline" in data
    assert "primary_reason" in data
    assert "target_skill_name" in data

@pytest.mark.asyncio
async def test_recommendation_feedback_endpoint(client: AsyncClient, auth_headers: dict):
    # Get a recommendation first
    recs_res = await client.get("/api/v1/recommendations?limit=1", headers=auth_headers)
    recs = recs_res.json()
    assert len(recs) > 0
    res_id = recs[0]["resource_id"]

    feedback_payload = {
        "resource_id": res_id,
        "feedback_type": "helpful",
        "rating": 5,
        "notes": "Extremely relevant to my current learning step"
    }

    response = await client.post("/api/v1/recommendations/feedback", json=feedback_payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["resource_id"] == res_id

@pytest.mark.asyncio
async def test_recommendation_observability_endpoint(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/recommendations/observability", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["engine_health"] == "healthy"
    assert data["algorithm_version"] == "hybrid-v2.0"
    assert "weights_configuration" in data

@pytest.mark.asyncio
async def test_recommendation_evaluate_endpoint(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/recommendations/evaluate?k=5", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert "comparison" in data
    assert len(data["comparison"]) == 5
