import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, LearnerProfile
from app.core.security import create_access_token
from app.services.ai.ai_service import AIService
from app.schemas.ai import AIChatRequest

@pytest.mark.asyncio
async def test_ai_navigator_blocks_when_no_career_selected(
    client: AsyncClient,
    db_session: AsyncSession
):
    """
    Verifies that when a learner has NO target career selected, the AI Navigator
    actively prompts the user to select a career track first rather than making ungrounded assumptions.
    """
    # Create a fresh user with no target career
    user_no_career = User(
        id="user-no-career-001",
        email="nocareer@example.com",
        display_name="Exploring User",
        role="learner"
    )
    db_session.add(user_no_career)
    await db_session.flush()

    profile = LearnerProfile(
        user_id=user_no_career.id,
        target_career_id=None,
        xp=0,
        streak_days=1,
        experience_level="beginner"
    )
    db_session.add(profile)
    await db_session.commit()

    token = create_access_token(user_id=user_no_career.id, email=user_no_career.email)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test AI Navigator sync chat
    ai_service = AIService(db_session, user_id=user_no_career.id)
    resp = await ai_service.chat_sync(AIChatRequest(message="What should I learn next?", stream=False))

    assert "Target Career Role Required" in resp.content
    assert "Career Tracks" in resp.content or "/careers" in resp.content

    # 2. Test via API endpoint
    api_resp = await client.post(
        "/api/v1/ai/chat/sync",
        headers=headers,
        json={"message": "Why is this my biggest skill gap?"}
    )
    assert api_resp.status_code == 200
    data = api_resp.json()
    assert "Target Career Role Required" in data["content"]

@pytest.mark.asyncio
async def test_admin_endpoints_permission_and_overview(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers_user1: dict
):
    """
    Verifies:
    1. Regular learners are rejected with 403 from admin endpoints.
    2. Admin users can view registered users and overview stats.
    3. Admin can update a learner's role.
    """
    # Sync regular learner user
    await client.post("/api/v1/auth/sync", headers=auth_headers_user1, json={"target_career_slug": "data-scientist"})

    # 1. Non-admin user tries to access admin endpoints -> 403 Forbidden
    resp_unauthorized = await client.get("/api/v1/admin/users", headers=auth_headers_user1)
    assert resp_unauthorized.status_code == 403
    assert "Administrative privileges required" in resp_unauthorized.json()["detail"]

    resp_overview_unauth = await client.get("/api/v1/admin/overview", headers=auth_headers_user1)
    assert resp_overview_unauth.status_code == 403

    # 2. Create an admin user
    admin_user = User(
        id="user-admin-test-001",
        email="superadmin@pathpilot.ai",
        display_name="Test SuperAdmin",
        role="admin"
    )
    db_session.add(admin_user)
    await db_session.flush()

    admin_profile = LearnerProfile(
        user_id=admin_user.id,
        xp=1500,
        streak_days=12,
        experience_level="advanced"
    )
    db_session.add(admin_profile)
    await db_session.commit()

    admin_token = create_access_token(user_id=admin_user.id, email=admin_user.email)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. Admin accesses GET /admin/users
    resp_users = await client.get("/api/v1/admin/users", headers=admin_headers)
    assert resp_users.status_code == 200
    users_list = resp_users.json()
    assert len(users_list) >= 2
    
    # Verify user fields are populated
    emails = [u["email"] for u in users_list]
    assert "superadmin@pathpilot.ai" in emails

    # 4. Admin accesses GET /admin/overview
    resp_overview = await client.get("/api/v1/admin/overview", headers=admin_headers)
    assert resp_overview.status_code == 200
    overview_data = resp_overview.json()
    assert overview_data["total_registered_users"] >= 2
    assert overview_data["total_admins"] >= 1
    assert "career_distribution" in overview_data

    # 5. Admin updates a user's role
    target_user_id = "user-test-001"
    resp_role_update = await client.patch(
        f"/api/v1/admin/users/{target_user_id}/role",
        headers=admin_headers,
        json={"role": "admin"}
    )
    assert resp_role_update.status_code == 200
    updated_data = resp_role_update.json()
    assert updated_data["id"] == target_user_id
    assert updated_data["role"] == "admin"
