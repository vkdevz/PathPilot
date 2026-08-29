import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.ai.tool_router import ToolRouter, TOOL_DEFINITIONS

@pytest.mark.asyncio
async def test_tool_definitions_schema():
    assert len(TOOL_DEFINITIONS) >= 6
    tool_names = [t["function"]["name"] for t in TOOL_DEFINITIONS]
    assert "get_learner_profile" in tool_names
    assert "get_learner_roadmap" in tool_names
    assert "get_skill_details_and_prerequisites" in tool_names
    assert "get_diagnostic_assessment_explanation" in tool_names
    assert "get_recommended_resources" in tool_names
    assert "log_study_progress" in tool_names

@pytest.mark.asyncio
async def test_diagnostic_assessment_tool(client: AsyncClient, auth_headers_user1: dict, db_session: AsyncSession):
    user_id = "user-test-001"
    await client.post(
        "/api/v1/auth/sync",
        headers=auth_headers_user1,
        json={"target_career_slug": "data-scientist"}
    )
    router = ToolRouter(db_session, user_id)
    
    # Query diagnostic explanation
    rec = await router.execute_tool("get_diagnostic_assessment_explanation", {"career_slug": "data-scientist"})
    assert rec.status == "success"
    assert rec.tool_output["career_name"] == "Data Scientist"
    assert len(rec.tool_output["questions"]) > 0

@pytest.mark.asyncio
async def test_unknown_tool_handling(db_session: AsyncSession):
    router = ToolRouter(db_session, "user-test-001")
    rec = await router.execute_tool("invalid_tool_name", {})
    assert rec.status == "error"
    assert "Unknown tool" in rec.tool_output["error"]
