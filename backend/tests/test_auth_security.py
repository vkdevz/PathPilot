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

@pytest.mark.asyncio
async def test_real_user_registration_and_login_flow(client: AsyncClient):
    """
    6. Complete real auth flow: Register -> Login with credentials -> Access private endpoints.
    """
    test_email = "new_real_learner@pathpilot.ai"
    test_password = "SecurePassword123!"

    # 1. Register new user
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": test_email,
            "password": test_password,
            "display_name": "Real Learner",
            "target_career_id": "data-scientist"
        }
    )
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == test_email
    assert reg_data["user"]["display_name"] == "Real Learner"
    assert reg_data["user"]["profile"]["target_career_id"] == "data-scientist"

    # 2. Duplicate registration rejected
    dup_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": test_email,
            "password": test_password,
            "display_name": "Duplicate"
        }
    )
    assert dup_resp.status_code == 400
    assert "already exists" in dup_resp.json()["detail"]

    # 3. Invalid login rejected
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": test_email,
            "password": "WrongPassword123"
        }
    )
    assert bad_login.status_code == 401

    # 4. Valid login issues new JWT access token
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={
            "email": test_email,
            "password": test_password
        }
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    jwt_token = login_data["access_token"]

    # 5. Access authenticated endpoint with newly issued token
    me_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {jwt_token}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == test_email

