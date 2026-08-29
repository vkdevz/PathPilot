import asyncio
import os
import sys
import uuid

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from database.seed import seed_database
from database.indexes import create_indexes
from repositories.user_repository import user_repository
from repositories.career_repository import career_repository
from repositories.session_repository import session_repository
from repositories.assessment_repository import assessment_repository
from repositories.skill_repository import skill_repository
from repositories.learning_path_repository import learning_path_repository
from repositories.feedback_repository import feedback_repository
from repositories.agent_trace_repository import agent_trace_repository
from main import app

async def run_all_tests():
    print("=" * 60)
    print("RUNNING PATHPILOT MONGODB PERSISTENCE & AUTH TEST SUITE")
    print("=" * 60)

    db = await connect_to_mongo()
    await create_indexes(db)

    # 1. MongoDB Connection
    res = await db.command("ping")
    assert res.get("ok") == 1.0, "1. MongoDB connection ping failed"
    print("[PASSED] 1. MongoDB connection verified")

    # Generate unique test execution run ID
    run_id = uuid.uuid4().hex[:8]

    # 2. User Creation
    test_uid = f"fb_uid_{run_id}"
    user = await user_repository.find_or_create_user(
        firebase_uid=test_uid,
        email=f"user_{run_id}@example.com",
        display_name="Test User"
    )
    assert user["firebase_uid"] == test_uid
    assert user["email"] == f"user_{run_id}@example.com"
    print("[PASSED] 2. User creation & lookup verified")

    # 3. Career Seed & Idempotency
    await seed_database()
    careers = await career_repository.get_all_careers()
    assert len(careers) > 0, "Careers collection should not be empty after seed"
    initial_count = len(careers)
    await seed_database()
    careers_again = await career_repository.get_all_careers()
    assert len(careers_again) == initial_count, "Seed operation must be idempotent"
    print(f"[PASSED] 3. Idempotent career seed verified ({len(careers)} careers)")

    # 4. Session Persists
    session_id = f"sess_{run_id}"
    session = await session_repository.create_session(session_id, test_uid)
    assert session["session_id"] == session_id
    assert session["firebase_uid"] == test_uid
    fetched_session = await session_repository.get_session(session_id)
    assert fetched_session is not None
    print("[PASSED] 4. Session persistence verified")

    # 5. Session Survives Backend Restart
    session_restart_id = f"sess_restart_{run_id}"
    await session_repository.create_session(session_restart_id, test_uid)
    await close_mongo_connection()
    await connect_to_mongo()
    survived_session = await session_repository.get_session(session_restart_id)
    assert survived_session is not None, "Session must survive backend restart"
    assert survived_session["session_id"] == session_restart_id
    print("[PASSED] 5. Session survival across backend restart verified")

    # 6. Career Selection Persists
    updated_session = await session_repository.update_session(session_id, {"selected_career": "data_scientist"})
    assert updated_session["selected_career"] == "data_scientist"
    fetched_career_session = await session_repository.get_session(session_id)
    assert fetched_career_session["selected_career"] == "data_scientist"
    print("[PASSED] 6. Career selection persistence verified")

    # 7. Assessment Persists
    assessment_id = f"asm_{run_id}"
    questions = [{"id": "q1", "question": "What is SQL?"}]
    assessment = await assessment_repository.create_assessment(
        assessment_id=assessment_id,
        session_id=session_id,
        firebase_uid=test_uid,
        career_id="data_scientist",
        questions=questions
    )
    assert assessment["assessment_id"] == assessment_id
    fetched_asm = await assessment_repository.get_assessment(assessment_id)
    assert fetched_asm is not None and fetched_asm["status"] == "started"
    print("[PASSED] 7. Assessment persistence verified")

    # 8. & 9. Assessment Answers & Result Persist
    answers = [{"question_id": "q_py_1", "skill_id": "python_ds", "selected_option": 2, "is_correct": True}]
    await assessment_repository.save_submitted_answers(assessment_id, session_id, test_uid, answers)
    result_data = {"overall_score": 100.0, "topic_scores": [{"skill_id": "python_ds", "score": 100.0, "strength_level": "Strong"}]}
    await assessment_repository.complete_assessment(assessment_id, result_data)
    completed_asm = await assessment_repository.get_assessment(assessment_id)
    assert completed_asm["status"] == "completed"
    assert completed_asm["result"]["overall_score"] == 100.0
    print("[PASSED] 8. & 9. Assessment answers and result persistence verified")

    # 10. Skill Profile Persists
    skills_map = {"sql": {"score": 85.0, "level": "strong"}}
    await skill_repository.upsert_skill_profile(
        firebase_uid=test_uid,
        session_id=session_id,
        career_id="data_scientist",
        skills=skills_map,
        overall_score=85.0
    )
    profile = await skill_repository.get_by_session_id(session_id)
    assert profile is not None and profile["skills"]["sql"]["score"] == 85.0
    print("[PASSED] 10. Skill profile persistence verified")

    # 11. Learning Path Persists
    milestones = [{"order": 1, "title": "Master SQL", "skill": "sql", "status": "available", "estimated_hours": 8}]
    await learning_path_repository.upsert_learning_path(
        firebase_uid=test_uid,
        session_id=session_id,
        career_id="data_scientist",
        milestones=milestones
    )
    path = await learning_path_repository.get_by_session_id(session_id)
    assert path is not None and len(path["milestones"]) == 1
    print("[PASSED] 11. Learning path persistence verified")

    # 12. Feedback Persists
    feedback = await feedback_repository.record_feedback(
        firebase_uid=test_uid,
        session_id=session_id,
        milestone_order=1,
        feedback_type="too_easy"
    )
    assert feedback["feedback_type"] == "too_easy"
    fb_records = await feedback_repository.get_session_feedback(session_id)
    assert len(fb_records) > 0
    print("[PASSED] 12. Feedback persistence verified")

    # 13. Firebase UID Identity
    stable_uid = f"firebase_stable_uid_{run_id}"
    user_doc = await user_repository.find_or_create_user(stable_uid, email=f"user_{run_id}@example.com")
    assert user_doc["firebase_uid"] == stable_uid
    print("[PASSED] 13. Firebase UID as primary user identity verified")

    # 14. Confirm No Custom JWT Auth Endpoints
    route_paths = [r.path for r in app.routes]
    assert "/token" not in route_paths, "No /token JWT endpoint should exist"
    assert "/login" not in route_paths, "No /login endpoint should exist"
    print("[PASSED] 14. No custom JWT auth endpoints confirmed")

    await close_mongo_connection()
    print("=" * 60)
    print("ALL 14 PERSISTENCE & AUTHENTICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

def test_all_mongodb_persistence():
    asyncio.run(run_all_tests())

if __name__ == "__main__":
    asyncio.run(run_all_tests())
