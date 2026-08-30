import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.progress_service import ProgressService
from app.services.assessment_service import AssessmentService
from app.services.ai.ai_service import AIService
from app.schemas.ai import AIChatRequest
from app.schemas.assessment import SingleAnswerSubmission
from app.repositories.user_repository import UserRepository
from app.repositories.progress_repository import ProgressRepository
from app.repositories.resource_repository import ResourceRepository

@pytest.mark.asyncio
async def test_study_sessions_separated_from_completions(
    client: AsyncClient,
    auth_headers_user1: dict,
    db_session: AsyncSession
):
    """
    Requirement 1: 3 study sessions != 3 completed courses.
    Manual study sessions must NOT increase completed courses count.
    """
    # 1. Sync User Profile
    await client.post("/api/v1/auth/sync", headers=auth_headers_user1, json={"target_career_slug": "data-scientist"})
    user_id = "user-test-001"

    progress_svc = ProgressService(db_session)
    user_repo = UserRepository(db_session)
    user_before = await user_repo.get_by_id(user_id)
    initial_xp = user_before.profile.xp if user_before and user_before.profile else 0

    # 2. Log 3 separate study sessions for Python (30m, 45m, 20m)
    session1 = await progress_svc.log_study_session(
        user_id=user_id,
        topic="Python for Data Science",
        duration_minutes=30,
        notes="Reviewed list comprehensions and generators"
    )
    assert session1.duration_minutes == 30
    assert session1.xp_earned == 20  # (30 // 15) * 10

    session2 = await progress_svc.log_study_session(
        user_id=user_id,
        topic="Python for Data Science",
        duration_minutes=45,
        notes="Numpy vectorized array operations"
    )
    assert session2.duration_minutes == 45
    assert session2.xp_earned == 30  # (45 // 15) * 10

    session3 = await progress_svc.log_study_session(
        user_id=user_id,
        topic="Python for Data Science",
        duration_minutes=20,
        notes="Pandas DataFrame indexing"
    )
    assert session3.duration_minutes == 20
    assert session3.xp_earned == 10  # (20 // 15) * 10

    # 3. Verify Study Sessions count = 3, Total Time = 95m
    summary = await progress_svc.get_study_time_summary(user_id)
    assert summary["total_minutes"] == 95
    assert summary["total_sessions"] == 3
    assert summary["today_minutes"] == 95

    # 4. CRITICAL: Verify Completed Learning is STILL 0 (Study session != Course completion)
    completed_learning = await progress_svc.get_completed_learning(user_id)
    assert len(completed_learning) == 0

    # 5. Verify User XP increased by 20 + 30 + 10 = 60 XP
    user_after = await user_repo.get_by_id(user_id)
    assert user_after.profile.xp == initial_xp + 60

@pytest.mark.asyncio
async def test_resource_completion_idempotency_and_xp(
    client: AsyncClient,
    auth_headers_user1: dict,
    db_session: AsyncSession
):
    """
    Requirement 2: Verified completion awards completion XP exactly once.
    Repeated completions do NOT award duplicate XP.
    """
    await client.post("/api/v1/auth/sync", headers=auth_headers_user1, json={"target_career_slug": "data-scientist"})
    user_id = "user-test-001"

    progress_svc = ProgressService(db_session)
    user_repo = UserRepository(db_session)
    resource_repo = ResourceRepository(db_session)

    all_res = await resource_repo.get_all(limit=1)
    target_res = all_res[0]

    user_start = await user_repo.get_by_id(user_id)
    start_xp = user_start.profile.xp

    # 1. Complete Resource first time
    res1 = await progress_svc.complete_resource(user_id, target_res.id, time_spent_minutes=target_res.estimated_minutes)
    assert res1["status"] == "completed"
    assert res1["already_completed"] is False
    assert res1["xp_earned"] == 50

    user_mid = await user_repo.get_by_id(user_id)
    assert user_mid.profile.xp == start_xp + 50

    # 2. Verify completed learning list has exactly 1 entry
    completed = await progress_svc.get_completed_learning(user_id)
    assert len(completed) == 1
    assert completed[0]["resource_id"] == target_res.id

    # 3. Attempt repeated completion (idempotency check)
    res2 = await progress_svc.complete_resource(user_id, target_res.id)
    assert res2["status"] == "completed"
    assert res2["already_completed"] is True
    assert res2["xp_earned"] == 0

    # User XP must NOT increase
    user_final = await user_repo.get_by_id(user_id)
    assert user_final.profile.xp == start_xp + 50

@pytest.mark.asyncio
async def test_controlled_ai_navigator_intents(
    client: AsyncClient,
    auth_headers_user1: dict,
    db_session: AsyncSession
):
    """
    Requirement 3: AI Navigator handles supported intents with grounded data,
    and gracefully redirects unsupported questions.
    """
    await client.post("/api/v1/auth/sync", headers=auth_headers_user1, json={"target_career_slug": "data-scientist"})
    user_id = "user-test-001"

    ai_service = AIService(db_session, user_id=user_id)

    # 1. Supported Intent: Next Learning Action
    resp_next = await ai_service.chat_sync(AIChatRequest(message="What should I learn next?", stream=False))
    assert resp_next.role == "assistant"
    assert "Data Scientist" in resp_next.content or "Milestone" in resp_next.content
    assert resp_next.telemetry.safety_status == "passed"

    # 2. Supported Intent: Skill Gap Explanation
    resp_gap = await ai_service.chat_sync(AIChatRequest(message="Why is this my biggest skill gap?", stream=False))
    assert resp_gap.role == "assistant"
    assert "Skill Gap" in resp_gap.content or "Diagnosis" in resp_gap.content

    # 3. Supported Intent: Today's Action
    resp_today = await ai_service.chat_sync(AIChatRequest(message="What should I focus on today?", stream=False))
    assert resp_today.role == "assistant"
    assert "Plan for Today" in resp_today.content or "Focus" in resp_today.content

    # 4. Supported Intent: Progress Explanation
    resp_prog = await ai_service.chat_sync(AIChatRequest(message="How am I progressing?", stream=False))
    assert resp_prog.role == "assistant"
    assert "Learning Metrics" in resp_prog.content or "XP" in resp_prog.content

    # 5. Unsupported Query: Off-topic general trivia
    resp_unsupported = await ai_service.chat_sync(AIChatRequest(message="What is the recipe for chocolate chip cookies?", stream=False))
    assert resp_unsupported.role == "assistant"
    assert "I am focused on your PathPilot learning journey" in resp_unsupported.content
    assert "What should I learn next?" in resp_unsupported.content

@pytest.mark.asyncio
async def test_diagnostic_position_ranking_and_correctness(
    client: AsyncClient,
    auth_headers_user1: dict,
    db_session: AsyncSession
):
    """
    Requirement 4: Diagnostic report grades all questions accurately, computes percentile ranking,
    and returns authoritative results without raw IDs or undefined state.
    """
    await client.post("/api/v1/auth/sync", headers=auth_headers_user1, json={"target_career_slug": "data-scientist"})
    user_id = "user-test-001"

    assessment_svc = AssessmentService(db_session)
    assessment = await assessment_svc.get_assessment_for_career("data-scientist")
    assert assessment is not None
    assert len(assessment.questions) > 0

    # Scenario A: All Correct Submission -> 100% score -> Top 5% ranking
    all_correct_answers = [
        SingleAnswerSubmission(question_id=q.id, selected_option=q.correct_answer_index)
        for q in assessment.questions
    ]
    res_high = await assessment_svc.evaluate_and_submit(user_id, "data-scientist", all_correct_answers)
    assert res_high["overall_score"] == 100.0
    assert "Top 5%" in res_high["position_rank"]
    assert res_high["percentile_rank"] == 95.0
    assert len(res_high["strong_topics"]) > 0
    assert len(res_high["weak_topics"]) == 0

    # Scenario B: Partial / Unanswered Submission (Only 1 question answered correctly, rest skipped)
    partial_answers = [
        SingleAnswerSubmission(question_id=assessment.questions[0].id, selected_option=assessment.questions[0].correct_answer_index)
    ]
    res_partial = await assessment_svc.evaluate_and_submit(user_id, "data-scientist", partial_answers)
    expected_score = round((1.0 / len(assessment.questions)) * 100, 1)
    assert res_partial["overall_score"] == expected_score
    assert len(res_partial["topic_scores"]) > 0

    # Scenario C: Get latest attempt via API endpoint
    resp_latest = await client.get("/api/v1/assessments/latest", headers=auth_headers_user1)
    assert resp_latest.status_code == 200
    latest_data = resp_latest.json()
    assert latest_data["overall_score"] == expected_score
    assert "position_rank" in latest_data
    assert latest_data["career_name"] == "Data Scientist"

@pytest.mark.asyncio
async def test_progress_api_endpoints_e2e(
    client: AsyncClient,
    auth_headers_user1: dict
):
    """
    Requirement 5: End-to-end API tests for Study Sessions, Summary, and Completed Learning.
    """
    await client.post("/api/v1/auth/sync", headers=auth_headers_user1, json={"target_career_slug": "data-scientist"})

    # 1. Post Study Session
    resp_session = await client.post(
        "/api/v1/progress/study-sessions",
        headers=auth_headers_user1,
        json={
            "topic": "Applied Statistics & Probability",
            "duration_minutes": 45,
            "notes": "Bayesian inference derivations"
        }
    )
    assert resp_session.status_code == 200
    sess_data = resp_session.json()
    assert sess_data["topic"] == "Applied Statistics & Probability"
    assert sess_data["duration_minutes"] == 45
    assert sess_data["xp_earned"] == 30

    # 2. Get Study Summary
    resp_summary = await client.get("/api/v1/progress/summary", headers=auth_headers_user1)
    assert resp_summary.status_code == 200
    summary_data = resp_summary.json()
    assert summary_data["total_minutes"] >= 45
    assert summary_data["total_sessions"] >= 1
    assert "streak_days" in summary_data

    # 3. Get Study Sessions List
    resp_list = await client.get("/api/v1/progress/study-sessions", headers=auth_headers_user1)
    assert resp_list.status_code == 200
    list_data = resp_list.json()
    assert len(list_data) >= 1
    assert list_data[0]["topic"] == "Applied Statistics & Probability"
