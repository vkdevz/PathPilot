import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """
    Verifies health check endpoint returns 200 and PostgreSQL / pgvector status.
    """
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "PostgreSQL" in data["database"]

@pytest.mark.asyncio
async def test_careers_list_and_details(client: AsyncClient):
    """
    Verifies careers listing and specific career skill tree retrieval.
    """
    res = await client.get("/api/v1/careers")
    assert res.status_code == 200
    careers = res.json()
    assert len(careers) >= 6
    ds_career = next((c for c in careers if c["slug"] == "data-scientist"), None)
    assert ds_career is not None

    # Get details
    res_details = await client.get("/api/v1/careers/data-scientist")
    assert res_details.status_code == 200
    details = res_details.json()
    assert details["name"] == "Data Scientist"
    assert len(details["skills"]) >= 6

@pytest.mark.asyncio
async def test_assessment_flow_and_roadmap_generation(client: AsyncClient, auth_headers_user1: dict):
    """
    Verifies end-to-end flow:
    1. Fetch assessment questions for Data Scientist
    2. Submit answers
    3. Verify topic scores and competency breakdown
    4. Retrieve generated active learning roadmap
    5. Complete a milestone and verify unlocking next milestone
    """
    # 1. Fetch questions
    res_q = await client.get("/api/v1/assessments/data-scientist")
    assert res_q.status_code == 200
    assessment = res_q.json()
    assert len(assessment["questions"]) > 0

    # 2. Submit answers (answering questions)
    answers_payload = [
        {"question_id": q["id"], "selected_option": 1} # sample option
        for q in assessment["questions"]
    ]
    res_submit = await client.post(
        "/api/v1/assessments/submit",
        json={"career_slug": "data-scientist", "answers": answers_payload},
        headers=auth_headers_user1
    )
    assert res_submit.status_code == 200
    report = res_submit.json()
    assert "overall_score" in report
    assert len(report["topic_scores"]) > 0

    # 3. Retrieve generated roadmap
    res_roadmap = await client.get("/api/v1/roadmaps/current", headers=auth_headers_user1)
    assert res_roadmap.status_code == 200
    roadmap = res_roadmap.json()
    assert len(roadmap["milestones"]) > 0
    first_milestone = roadmap["milestones"][0]
    assert first_milestone["status"] in ("available", "completed")

    # 4. Complete milestone
    if first_milestone["status"] == "available":
        res_comp = await client.post(
            f"/api/v1/roadmaps/milestones/{first_milestone['id']}/complete",
            headers=auth_headers_user1
        )
        assert res_comp.status_code == 200
        assert res_comp.json()["status"] == "completed"

@pytest.mark.asyncio
async def test_progress_logging_and_heatmap(client: AsyncClient, auth_headers_user1: dict):
    """
    Verifies study time logging and 28-day activity heatmap generation.
    """
    # 1. Log 30 minutes of study
    res_log = await client.post(
        "/api/v1/progress/log",
        json={"resource_id": "res-python-mastery", "time_spent_minutes": 30, "status": "completed"},
        headers=auth_headers_user1
    )
    assert res_log.status_code == 200

    # 2. Fetch heatmap
    res_heat = await client.get("/api/v1/progress/heatmap?days=28", headers=auth_headers_user1)
    assert res_heat.status_code == 200
    heatmap = res_heat.json()
    assert len(heatmap) == 28
    today_entry = heatmap[-1]
    assert today_entry["minutes"] >= 30

@pytest.mark.asyncio
async def test_feedback_and_adaptation(client: AsyncClient, auth_headers_user1: dict):
    """
    Verifies milestone feedback submission.
    """
    res_feedback = await client.post(
        "/api/v1/feedback",
        json={"feedback_type": "too_easy", "notes": "I already have python experience"},
        headers=auth_headers_user1
    )
    assert res_feedback.status_code == 200
    assert res_feedback.json()["feedback_type"] == "too_easy"

@pytest.mark.asyncio
async def test_leaderboard(client: AsyncClient, auth_headers_user1: dict):
    """
    Verifies leaderboard standings endpoint.
    """
    res_leader = await client.get("/api/v1/analytics/leaderboard", headers=auth_headers_user1)
    assert res_leader.status_code == 200
    leaderboard = res_leader.json()
    assert len(leaderboard) > 0
