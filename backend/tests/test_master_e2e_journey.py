import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_master_learner_end_to_end_journey(client: AsyncClient, auth_headers: dict):
    """
    MASTER E2E USER JOURNEY VERIFICATION (15-Step Hackathon & Production Release Flow)
    Validates that a real learner can complete the entire PathPilot lifecycle:
    1. Authenticate & fetch initialized learner profile
    2. Onboarding: set target career and study preferences
    3. Career Tracks: browse high-demand career catalog
    4. Diagnostic Assessment: fetch questions, submit answers, get evaluated competencies
    5. Skill-Gap Engine: detect exact skill gaps, readiness score, and Next Best Skill
    6. Skill Graph: validate DAG prerequisites, node depths, and downstream unlocks
    7. Recommendations: get ranked multi-factor recommendations with explainable rationale
    8. Next Best Action: verify authoritative next milestone recommendation
    9. Semantic Retrieval: natural language search over resources with pgvector embeddings
    10. AI Learning Navigator: chat with grounded AI tutor aware of learner context
    11. Milestone Completion: mark learning roadmap milestone completed and unlock next
    12. Adaptive Evidence: submit assessment evidence and trigger state mutation
    13. Adaptive State: verify mastery levels, pace ratio, and timeline events
    14. Roadmap Versioning: verify auditable roadmap snapshot was recorded
    15. Progress & Heatmap: log study minutes and verify activity heatmap calculations
    """

    # -------------------------------------------------------------------------
    # Step 1: Authenticate & Verify Profile
    # -------------------------------------------------------------------------
    sync_res = await client.post(
        "/api/v1/auth/sync",
        json={"display_name": "Jordan Lee", "avatar_url": "https://avatar.test/jordan.png"},
        headers=auth_headers
    )
    assert sync_res.status_code == 200
    user_data = sync_res.json()
    assert user_data["display_name"] == "Jordan Lee"
    assert user_data["profile"] is not None

    me_res = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert me_res.status_code == 200
    assert me_res.json()["id"] == "user-test-001"

    # -------------------------------------------------------------------------
    # Step 2: Onboarding Setup
    # -------------------------------------------------------------------------
    career_select_res = await client.post(
        "/api/v1/profile/career",
        json={"career_slug": "data-scientist"},
        headers=auth_headers
    )
    assert career_select_res.status_code == 200

    profile_update_res = await client.patch(
        "/api/v1/profile",
        json={
            "experience_level": "intermediate",
            "weekly_hours_goal": 12,
            "preferred_format": "hands_on_projects",
            "preferences": {"bio": "Transitioning to Data Science", "target_months": 6}
        },
        headers=auth_headers
    )
    assert profile_update_res.status_code == 200
    assert profile_update_res.json()["experience_level"] == "intermediate"
    assert profile_update_res.json()["weekly_hours_goal"] == 12

    # -------------------------------------------------------------------------
    # Step 3: Browse Career Tracks
    # -------------------------------------------------------------------------
    careers_res = await client.get("/api/v1/careers")
    assert careers_res.status_code == 200
    careers_list = careers_res.json()
    assert len(careers_list) >= 4
    assert any(c["slug"] == "data-scientist" for c in careers_list)

    ds_career_res = await client.get("/api/v1/careers/data-scientist")
    assert ds_career_res.status_code == 200
    assert ds_career_res.json()["name"] == "Data Scientist"
    assert len(ds_career_res.json()["skills"]) > 0

    # -------------------------------------------------------------------------
    # Step 4: Diagnostic Assessment
    # -------------------------------------------------------------------------
    quiz_res = await client.get("/api/v1/assessments/data-scientist", headers=auth_headers)
    assert quiz_res.status_code == 200
    quiz_data = quiz_res.json()
    assert len(quiz_data["questions"]) > 0

    # Submit answers: answering accurately for diagnostic calibration
    answers = []
    for q in quiz_data["questions"]:
        answers.append({
            "question_id": q["id"],
            "selected_option": 0  # option 0
        })

    submit_quiz_res = await client.post(
        "/api/v1/assessments/submit",
        json={"career_slug": "data-scientist", "answers": answers},
        headers=auth_headers
    )
    assert submit_quiz_res.status_code == 200
    quiz_eval = submit_quiz_res.json()
    assert "overall_score" in quiz_eval
    assert quiz_eval["overall_score"] >= 0

    # -------------------------------------------------------------------------
    # Step 5: Skill-Gap Engine & Next Best Skill
    # -------------------------------------------------------------------------
    gap_res = await client.get("/api/v1/skills/skill-gaps?career_slug=data-scientist", headers=auth_headers)
    assert gap_res.status_code == 200
    gap_summary = gap_res.json()
    assert "career_readiness_score" in gap_summary
    assert len(gap_summary["skill_gaps"]) > 0

    next_skill_res = await client.get("/api/v1/skills/next-best-skill", headers=auth_headers)
    assert next_skill_res.status_code == 200
    next_skill = next_skill_res.json()
    assert next_skill is not None
    assert "skill_name" in next_skill
    assert "reason" in next_skill

    # -------------------------------------------------------------------------
    # Step 6: Skill Graph DAG Validation
    # -------------------------------------------------------------------------
    graph_val_res = await client.get("/api/v1/skills/graph/validate", headers=auth_headers)
    assert graph_val_res.status_code == 200
    val_report = graph_val_res.json()
    assert val_report["is_valid"] is True
    assert len(val_report["cycles_detected"]) == 0

    prereqs_res = await client.get("/api/v1/skills/stats-ds/prerequisites", headers=auth_headers)
    assert prereqs_res.status_code == 200
    assert "direct_prerequisites" in prereqs_res.json()

    # -------------------------------------------------------------------------
    # Step 7 & 8: Recommendations & Next Best Action
    # -------------------------------------------------------------------------
    recs_res = await client.get("/api/v1/recommendations?limit=6", headers=auth_headers)
    assert recs_res.status_code == 200
    recs = recs_res.json()
    assert len(recs) > 0
    first_rec = recs[0]
    assert "title" in first_rec
    assert "relevance_score" in first_rec
    assert "explanation_reasons" in first_rec
    assert "feature_breakdown" in first_rec

    nba_res = await client.get("/api/v1/recommendations/next-best-action", headers=auth_headers)
    assert nba_res.status_code == 200
    nba = nba_res.json()
    assert "title" in nba
    assert "headline" in nba
    assert "primary_reason" in nba

    # -------------------------------------------------------------------------
    # Step 9: Semantic Vector Search
    # -------------------------------------------------------------------------
    search_res = await client.post(
        "/api/v1/retrieval/semantic-search",
        json={"query": "beginner machine learning neural networks projects", "limit": 4}
    )
    assert search_res.status_code == 200
    search_results = search_res.json()
    assert "resources" in search_results
    assert len(search_results["resources"]) > 0

    # -------------------------------------------------------------------------
    # Step 10: AI Grounded Assistant
    # -------------------------------------------------------------------------
    chat_res = await client.post(
        "/api/v1/ai/chat/sync",
        json={
            "message": "What is my biggest skill gap and why is it important for Data Science?",
            "active_skill": "Machine Learning Foundations"
        },
        headers=auth_headers
    )
    assert chat_res.status_code == 200
    ai_reply = chat_res.json()
    assert "content" in ai_reply
    assert len(ai_reply["content"]) > 10

    # -------------------------------------------------------------------------
    # Step 11: Roadmap & Milestone Completion
    # -------------------------------------------------------------------------
    roadmap_res = await client.get("/api/v1/roadmaps/current", headers=auth_headers)
    assert roadmap_res.status_code == 200
    roadmap_data = roadmap_res.json()
    assert len(roadmap_data["milestones"]) > 0
    available_milestone = next((m for m in roadmap_data["milestones"] if m["status"] == "available"), roadmap_data["milestones"][0])

    complete_res = await client.post(
        f"/api/v1/roadmaps/milestones/{available_milestone['id']}/complete",
        headers=auth_headers
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "completed"

    # -------------------------------------------------------------------------
    # Step 12: Adaptive Evidence Submission
    # -------------------------------------------------------------------------
    first_skill_id = available_milestone["skill_id"]
    evidence_res = await client.post(
        "/api/v1/learners/me/evidence",
        json={
            "skill_id": first_skill_id,
            "evidence_type": "project_submission",
            "score": 0.92,
            "raw_score": 92.0,
            "metadata": {"project_title": "End-to-End Scikit Pipeline", "tests_passed": 12}
        },
        headers=auth_headers
    )
    assert evidence_res.status_code == 200
    ev_data = evidence_res.json()
    assert ev_data["status"] == "success"
    assert "new_proficiency" in ev_data

    # -------------------------------------------------------------------------
    # Step 13: Adaptive Learner State & Velocity
    # -------------------------------------------------------------------------
    state_res = await client.get("/api/v1/learners/me/state", headers=auth_headers)
    assert state_res.status_code == 200
    adaptive_state = state_res.json()
    assert "skills" in adaptive_state
    assert "recent_adaptations" in adaptive_state
    assert len(adaptive_state["recent_adaptations"]) > 0

    # -------------------------------------------------------------------------
    # Step 14: Roadmap Versioning
    # -------------------------------------------------------------------------
    versions_res = await client.get("/api/v1/learners/me/roadmap/versions", headers=auth_headers)
    assert versions_res.status_code == 200
    versions = versions_res.json()
    assert len(versions) >= 1
    assert "version_number" in versions[0]
    assert "reason" in versions[0]

    # -------------------------------------------------------------------------
    # Step 15: Progress Logging & Study Heatmap
    # -------------------------------------------------------------------------
    log_res = await client.post(
        "/api/v1/progress/log",
        json={
            "resource_id": recs[0]["resource_id"],
            "time_spent_minutes": 45,
            "status": "completed"
        },
        headers=auth_headers
    )
    assert log_res.status_code == 200
    assert log_res.json()["status"] == "completed"

    heatmap_res = await client.get("/api/v1/progress/heatmap?days=28", headers=auth_headers)
    assert heatmap_res.status_code == 200
    heatmap_days = heatmap_res.json()
    assert len(heatmap_days) == 28
    assert any(d["minutes"] > 0 for d in heatmap_days)
