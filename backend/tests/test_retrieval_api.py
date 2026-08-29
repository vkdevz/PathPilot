import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_api_unified_semantic_search(client: AsyncClient, auth_headers_user1: dict):
    response = await client.post(
        "/api/v1/retrieval/semantic-search",
        json={
            "query": "machine learning data science python",
            "entity_types": ["resource", "skill", "career"],
            "limit": 3
        },
        headers=auth_headers_user1
    )
    assert response.status_code == 200
    data = response.json()
    assert "resources" in data
    assert "skills" in data
    assert "careers" in data
    assert len(data["resources"]) > 0

@pytest.mark.asyncio
async def test_api_search_resources_filtered(client: AsyncClient, auth_headers_user1: dict):
    response = await client.post(
        "/api/v1/retrieval/resources",
        json={
            "query": "web development backend fastapi",
            "difficulties": ["Beginner", "Intermediate"],
            "min_similarity": 0.1,
            "limit": 5
        },
        headers=auth_headers_user1
    )
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    for it in items:
        assert "similarity_score" in it
        assert "reasons" in it
        assert it["difficulty"] in ("Beginner", "Intermediate")

@pytest.mark.asyncio
async def test_api_search_skills_and_careers(client: AsyncClient, auth_headers_user1: dict):
    # Skills
    res_sk = await client.post(
        "/api/v1/retrieval/skills",
        json={"query": "sql database queries", "limit": 3},
        headers=auth_headers_user1
    )
    assert res_sk.status_code == 200
    assert len(res_sk.json()) > 0

    # Careers
    res_c = await client.post(
        "/api/v1/retrieval/careers",
        json={"query": "cloud devops infrastructure", "limit": 2},
        headers=auth_headers_user1
    )
    assert res_c.status_code == 200
    assert len(res_c.json()) > 0

@pytest.mark.asyncio
async def test_api_retrieval_stats(client: AsyncClient, auth_headers_user1: dict):
    response = await client.get("/api/v1/retrieval/stats", headers=auth_headers_user1)
    assert response.status_code == 200
    data = response.json()
    assert "total_embeddings" in data
    assert "dimensions" in data
    assert data["dimensions"] == 1536

@pytest.mark.asyncio
async def test_api_retrieval_reindex(client: AsyncClient, auth_headers_user1: dict):
    response = await client.post(
        "/api/v1/retrieval/reindex",
        json={"force": False},
        headers=auth_headers_user1
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert "total_processed" in data

@pytest.mark.asyncio
async def test_api_retrieval_evaluate(client: AsyncClient, auth_headers_user1: dict):
    response = await client.get("/api/v1/retrieval/evaluate?k=5", headers=auth_headers_user1)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "metrics" in data
    assert "precision_at_5" in data["metrics"]
