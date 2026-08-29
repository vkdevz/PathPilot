import pytest
from httpx import AsyncClient
from app.core.security import verify_supabase_token, create_test_jwt

@pytest.mark.asyncio
async def test_unauthenticated_request_rejected(client: AsyncClient):
    """
    1. Unauthenticated users cannot access private endpoints (returns 401).
    """
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert "Authorization header is required" in response.json()["detail"]

@pytest.mark.asyncio
async def test_invalid_token_format_rejected(client: AsyncClient):
    """
    2. Invalid authorization token format returns 401.
    """
    response = await client.get("/api/v1/auth/me", headers={"Authorization": "InvalidFormatToken"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_tampered_token_rejected(client: AsyncClient):
    """
    3. Tampered or fake JWT signature is rejected with 401.
    """
    fake_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyJ9.invalid_signature"
    response = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {fake_token}"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_valid_supabase_token_authenticates(client: AsyncClient, auth_headers_user1: dict):
    """
    4. Valid signed Supabase JWT creates user & returns profile.
    """
    response = await client.get("/api/v1/auth/me", headers=auth_headers_user1)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "user-test-001"
    assert data["email"] == "user1@example.com"
    assert data["profile"] is not None
    assert data["profile"]["xp"] == 0

@pytest.mark.asyncio
async def test_user_isolation(client: AsyncClient, auth_headers_user1: dict, auth_headers_user2: dict):
    """
    5. User A cannot view User B's private profile or state.
    """
    # User 1 updates profile
    resp1 = await client.patch(
        "/api/v1/profile",
        json={"experience_level": "advanced", "weekly_hours_goal": 15},
        headers=auth_headers_user1
    )
    assert resp1.status_code == 200
    assert resp1.json()["experience_level"] == "advanced"

    # User 2 checks own profile - must remain default and isolated
    resp2 = await client.get("/api/v1/profile", headers=auth_headers_user2)
    assert resp2.status_code == 200
    assert resp2.json()["experience_level"] == "beginner"
    assert resp2.json()["weekly_hours_goal"] == 5
