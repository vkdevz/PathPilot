import json
import uuid
import sys
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Header, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

from database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from database.indexes import create_indexes
from database.seed import seed_database
from repositories.user_repository import user_repository
from repositories.career_repository import career_repository
from repositories.course_repository import course_repository
from repositories.session_repository import session_repository
from repositories.assessment_repository import assessment_repository
from repositories.skill_repository import skill_repository
from repositories.learning_path_repository import learning_path_repository
from repositories.feedback_repository import feedback_repository
from repositories.agent_trace_repository import agent_trace_repository
from auth import verify_firebase_token, get_current_user_uid
from services.scoring import calculate_assessment_score
from services.recommendation import generate_recommendations
from services.chatbot import answer_user_query
from seed_data import QUESTIONS_DATA

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB, create indexes, seed initial data if empty
    db = await connect_to_mongo()
    await create_indexes(db)
    
    # Check if careers exist, if not run idempotent seed
    careers_count = await db["careers"].count_documents({})
    if careers_count == 0:
        await seed_database()

    yield

    # Shutdown: Close MongoDB connection
    await close_mongo_connection()

app = FastAPI(title="PathPilot API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------
class StartSessionRequest(BaseModel):
    session_id: Optional[str] = None
    firebase_token: Optional[str] = None
    email: Optional[str] = None
    display_name: Optional[str] = None


class SelectCareerRequest(BaseModel):
    career_id: str

class StartAssessmentRequest(BaseModel):
    session_id: str
    career_id: str

class SubmitAssessmentRequest(BaseModel):
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    career_id: Optional[str] = None
    assessment_id: Optional[str] = None
    answers: List[Dict[str, Any]]

class FeedbackRequest(BaseModel):
    session_id: Optional[str] = None
    milestone_order: Optional[int] = 1
    skill_id: Optional[str] = None
    feedback_type: str  # 'too_easy', 'too_hard', 'useful', 'not_useful'

class ChatRequest(BaseModel):
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    query: Optional[str] = None
    message: Optional[str] = None
    user_context: Optional[Dict[str, Any]] = None

# Helper to resolve user Firebase UID
def resolve_firebase_uid(authorization: Optional[Any], provided_uid: Optional[str] = None) -> str:
    if isinstance(authorization, str) and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        decoded = verify_firebase_token(token)
        return decoded.get("uid", "dev-user-123")
    if provided_uid and provided_uid != "null":
        return provided_uid
    return "dev-user-123"


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------
@app.get("/api/health")
@app.get("/health")
async def health_check():
    db = get_database()
    # Ping MongoDB
    await db.command("ping")
    return {"status": "online", "database": "MongoDB path_pilot", "app": "PathPilot AI Engine"}

# ---------------------------------------------------------
# 1. Careers Endpoints
# ---------------------------------------------------------
@app.get("/careers")
@app.get("/api/careers")
async def get_careers():
    careers = await career_repository.get_all_careers()
    result = []
    for c in careers:
        result.append({
            "id": c.get("career_id") or c.get("id"),
            "career_id": c.get("career_id") or c.get("id"),
            "name": c.get("name"),
            "category": c.get("category", "Technology"),
            "description": c.get("description"),
            "icon": c.get("icon", "🎯"),
            "required_skills": c.get("required_skills", []),
            "skill_weights": c.get("skill_weights", {}),
            "recommended_skill_order": c.get("recommended_skill_order", []),
            "skills": c.get("skills", [])
        })
    return result

@app.get("/careers/{career_id}")
@app.get("/api/careers/{career_id}")
async def get_career_by_id(career_id: str):
    c = await career_repository.get_career_by_id(career_id)
    if not c:
        raise HTTPException(status_code=404, detail="Career not found")
    return {
        "id": c.get("career_id") or c.get("id"),
        "career_id": c.get("career_id") or c.get("id"),
        "name": c.get("name"),
        "category": c.get("category", "Technology"),
        "description": c.get("description"),
        "icon": c.get("icon", "🎯"),
        "required_skills": c.get("required_skills", []),
        "skill_weights": c.get("skill_weights", {}),
        "recommended_skill_order": c.get("recommended_skill_order", []),
        "skills": c.get("skills", [])
    }

@app.get("/api/careers/{career_id}/skills")
async def get_career_skills(career_id: str):
    c = await career_repository.get_career_by_id(career_id)
    if not c:
        raise HTTPException(status_code=404, detail="Career not found")
    return c.get("skills", [])

# ---------------------------------------------------------
# 2. Session Start Flow
# ---------------------------------------------------------
@app.post("/session/start")
@app.post("/api/session/start")
async def start_session(
    req: Optional[StartSessionRequest] = None,
    authorization: Optional[str] = Header(None)
):
    firebase_token = req.firebase_token if req else None
    if firebase_token:
        decoded = verify_firebase_token(firebase_token)
        firebase_uid = decoded.get("uid")
        email = decoded.get("email")
        display_name = decoded.get("name")
    else:
        firebase_uid = resolve_firebase_uid(authorization)
        email = req.email if req else None
        display_name = req.display_name if req else None

    # Find or create user document in MongoDB
    user = await user_repository.find_or_create_user(
        firebase_uid=firebase_uid,
        email=email,
        display_name=display_name
    )

    # Check if caller specified a session_id or if an active session already exists for this Firebase user
    session_doc = None
    if req and req.session_id:
        session_doc = await session_repository.get_session(req.session_id)
        session_id = req.session_id
    else:
        session_doc = await session_repository.get_active_session_by_learner(firebase_uid)
        if session_doc:
            session_id = session_doc["session_id"]
        else:
            session_id = f"session_{uuid.uuid4().hex[:12]}"

    if not session_doc:
        session_doc = await session_repository.create_session(
            session_id=session_id,
            firebase_uid=firebase_uid,
            learner_profile=user.get("profile", {})
        )

        await agent_trace_repository.add_trace_event(
            firebase_uid=firebase_uid,
            session_id=session_id,
            agent="Profile Agent",
            message="Session started and learner profile initialized"
        )

    return {
        "session_id": session_doc.get("session_id", session_id),
        "learner_id": session_doc.get("learner_id", firebase_uid),
        "firebase_uid": session_doc.get("firebase_uid", firebase_uid),
        "selected_career": session_doc.get("selected_career"),
        "learner_profile": session_doc.get("learner_profile", user.get("profile", {})),
        "status": session_doc.get("status", "active")
    }

@app.post("/session/{session_id}/career")
@app.post("/api/session/{session_id}/career")
async def select_session_career(
    session_id: str,
    req: SelectCareerRequest,
    authorization: Optional[str] = Header(None)
):
    session = await session_repository.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")

    # Verify session ownership if authorization is provided
    caller_uid = resolve_firebase_uid(authorization)
    session_uid = session.get("firebase_uid") or session.get("learner_id")
    if authorization and session_uid and caller_uid != "dev-user-123" and session_uid != caller_uid:
        raise HTTPException(status_code=403, detail="Unauthorized access to this session.")

    career = await career_repository.get_career_by_id(req.career_id)
    if not career:
        raise HTTPException(status_code=404, detail=f"Career '{req.career_id}' not found.")

    updated = await session_repository.update_session(
        session["session_id"],
        {"selected_career": career["career_id"]}
    )

    await agent_trace_repository.add_trace_event(
        firebase_uid=session.get("firebase_uid", caller_uid),
        session_id=session["session_id"],
        agent="Recommendation Agent",
        message=f"Selected career updated to {career['name']}"
    )

    return {
        "session_id": session["session_id"],
        "selected_career": career["career_id"],
        "career_name": career["name"],
        "status": updated.get("status", "active") if updated else "active"
    }


# ---------------------------------------------------------
# 3. Assessment Endpoints
# ---------------------------------------------------------
@app.get("/api/assessment/{career_id}/questions")
async def get_assessment_questions_legacy(career_id: str):
    career = await career_repository.get_career_by_id(career_id)
    career_id_matched = career["career_id"] if career else career_id

    # Filter matching questions
    q_list = [q for q in QUESTIONS_DATA if q.get("career_id") in (career_id, career_id_matched)]
    if not q_list:
        # Generic questions fallback if specific career lacks questions in seed
        q_list = QUESTIONS_DATA[:4]

    return q_list

@app.post("/assessment/start")
@app.post("/api/assessment/start")
async def start_assessment(
    req: StartAssessmentRequest,
    authorization: Optional[str] = Header(None)
):
    session = await session_repository.get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    career = await career_repository.get_career_by_id(req.career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")

    career_id_matched = career["career_id"]
    q_list = [q for q in QUESTIONS_DATA if q.get("career_id") in (req.career_id, career_id_matched)]
    if not q_list:
        q_list = QUESTIONS_DATA[:4]

    assessment_id = f"asm_{uuid.uuid4().hex[:12]}"
    assessment_doc = await assessment_repository.create_assessment(
        assessment_id=assessment_id,
        session_id=req.session_id,
        firebase_uid=session["firebase_uid"],
        career_id=career_id_matched,
        questions=q_list
    )

    await session_repository.update_session(
        req.session_id,
        {"assessment_id": assessment_id, "selected_career": career_id_matched}
    )

    await agent_trace_repository.add_trace_event(
        firebase_uid=session["firebase_uid"],
        session_id=req.session_id,
        agent="Assessment Agent",
        message=f"Assessment {assessment_id} generated for {career['name']}"
    )

    return {
        "assessment_id": assessment_id,
        "session_id": req.session_id,
        "career_id": career_id_matched,
        "questions": q_list,
        "status": "started"
    }

@app.post("/assessment/{assessment_id}/submit")
@app.post("/api/assessment/{career_id_or_asm_id}/submit")
@app.post("/api/assessment/submit")
async def submit_assessment(
    req: SubmitAssessmentRequest,
    assessment_id: Optional[str] = None,
    career_id_or_asm_id: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    # Resolve target assessment_id / session_id / career_id
    effective_assessment_id = assessment_id or req.assessment_id or (career_id_or_asm_id if career_id_or_asm_id and career_id_or_asm_id.startswith("asm_") else None)
    
    session = None
    assessment = None
    if effective_assessment_id:
        assessment = await assessment_repository.get_assessment(effective_assessment_id)
        if assessment:
            session = await session_repository.get_session(assessment["session_id"])

    if not session and req.session_id:
        session = await session_repository.get_session(req.session_id)

    if not session:
        # Create session fallback for legacy single-call frontend submit
        firebase_uid = resolve_firebase_uid(authorization, req.user_id)
        session_id = f"sess_{uuid.uuid4().hex[:12]}"
        session = await session_repository.create_session(session_id, firebase_uid)

    session_id = session["session_id"]
    firebase_uid = session["firebase_uid"]
    career_id = req.career_id or session.get("selected_career") or (career_id_or_asm_id if career_id_or_asm_id and not career_id_or_asm_id.startswith("asm_") else "data_scientist")

    career = await career_repository.get_career_by_id(career_id)
    career_id = career["career_id"] if career else career_id

    # Retrieve question catalog for scoring
    q_list = assessment.get("questions") if assessment else [q for q in QUESTIONS_DATA if q.get("career_id") in (career_id, req.career_id)]
    if not q_list:
        q_list = QUESTIONS_DATA[:4]

    # Calculate score using existing scoring logic
    report = calculate_assessment_score(req.answers, q_list)

    if not effective_assessment_id:
        effective_assessment_id = f"asm_{uuid.uuid4().hex[:12]}"
        await assessment_repository.create_assessment(
            assessment_id=effective_assessment_id,
            session_id=session_id,
            firebase_uid=firebase_uid,
            career_id=career_id,
            questions=q_list
        )

    # 1. Save answers in assessment_answers collection
    evaluated_answers = []
    q_map = {q["id"]: q for q in q_list}
    for ans in req.answers:
        q_id = ans.get("question_id") or ans.get("id")
        q = q_map.get(q_id, {})
        is_correct = (ans.get("selected_option") == q.get("correct_answer"))
        evaluated_answers.append({
            "question_id": q_id,
            "skill_id": q.get("skill_id", "general"),
            "selected_option": ans.get("selected_option"),
            "is_correct": is_correct
        })
    await assessment_repository.save_submitted_answers(effective_assessment_id, session_id, firebase_uid, evaluated_answers)

    # 2. Complete assessment
    await assessment_repository.complete_assessment(effective_assessment_id, report)

    # 3. Save skill profile in skill_profiles collection
    skills_map = {}
    for t in report["topic_scores"]:
        skills_map[t["skill_id"]] = {
            "name": t["skill_name"],
            "score": t["score"],
            "level": t["strength_level"].lower()
        }
    await skill_repository.upsert_skill_profile(
        firebase_uid=firebase_uid,
        session_id=session_id,
        career_id=career_id,
        skills=skills_map,
        overall_score=report["overall_score"]
    )

    # 4. Generate & Save learning path in learning_paths collection
    career_skills = career.get("skills", []) if career else []
    user_skill_scores = {t["skill_id"]: t["score"] for t in report["topic_scores"]}
    recommendations = generate_recommendations(career_skills, user_skill_scores)

    milestones = []
    for idx, r in enumerate(recommendations, start=1):
        milestones.append({
            "order": idx,
            "title": f"Master {r['skill_name']}",
            "skill": r["skill_id"],
            "status": "available" if idx == 1 else "locked",
            "reasoning": r["reason"],
            "estimated_hours": max(1, round(r.get("estimated_minutes", 90) / 60))
        })

    await learning_path_repository.upsert_learning_path(
        firebase_uid=firebase_uid,
        session_id=session_id,
        career_id=career_id,
        milestones=milestones
    )

    # 5. Update session document
    await session_repository.update_session(
        session_id,
        {
            "selected_career": career_id,
            "assessment_id": effective_assessment_id,
            "assessment_result": report,
            "skill_gaps": report["weak_topics"],
            "learning_path": milestones,
            "status": "completed"
        }
    )

    await agent_trace_repository.add_trace_event(
        firebase_uid=firebase_uid,
        session_id=session_id,
        agent="Recommendation Agent",
        message=f"Assessment evaluated. Overall score: {report['overall_score']}%. Learning path created."
    )

    return {
        "assessment_id": effective_assessment_id,
        "session_id": session_id,
        "overall_score": report["overall_score"],
        "topic_scores": report["topic_scores"],
        "strong_topics": report["strong_topics"],
        "moderate_topics": report["moderate_topics"],
        "weak_topics": report["weak_topics"],
        "recommendations": recommendations,
        "learning_path": milestones
    }

# ---------------------------------------------------------
# 4. Results, Skills, and Path Retrieval Endpoints
# ---------------------------------------------------------
@app.get("/session/{session_id}/assessment/result")
@app.get("/api/session/{session_id}/assessment/result")
async def get_assessment_result(session_id: str):
    session = await session_repository.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": session_id,
        "assessment_id": session.get("assessment_id"),
        "result": session.get("assessment_result")
    }

@app.get("/session/{session_id}/skills")
@app.get("/api/session/{session_id}/skills")
async def get_session_skills(session_id: str):
    skill_profile = await skill_repository.get_by_session_id(session_id)
    if not skill_profile:
        raise HTTPException(status_code=404, detail="Skill profile not found for this session")
    return skill_profile

@app.get("/session/{session_id}/path")
@app.get("/api/session/{session_id}/path")
async def get_session_learning_path(session_id: str):
    path_doc = await learning_path_repository.get_by_session_id(session_id)
    if not path_doc:
        raise HTTPException(status_code=404, detail="Learning path not found for this session")
    return path_doc

@app.get("/api/recommendations")
async def get_user_recommendations(user_id: str, career_id: str):
    career = await career_repository.get_career_by_id(career_id)
    career_skills = career.get("skills", []) if career else []

    latest_profile = await skill_repository.get_latest_user_profile(user_id)
    user_skill_scores = {}
    if latest_profile:
        for sk_id, info in latest_profile.get("skills", {}).items():
            user_skill_scores[sk_id] = info.get("score", 0.0)

    recommendations = generate_recommendations(career_skills, user_skill_scores)
    return recommendations

# ---------------------------------------------------------
# 5. Feedback Endpoint
# ---------------------------------------------------------
@app.post("/session/{session_id}/feedback")
@app.post("/api/session/{session_id}/feedback")
@app.post("/api/recommendations/feedback")
async def submit_feedback(
    req: FeedbackRequest,
    session_id: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    effective_session_id = session_id or req.session_id
    if not effective_session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    session = await session_repository.get_session(effective_session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    firebase_uid = session["firebase_uid"]

    # Record feedback in feedback collection
    await feedback_repository.record_feedback(
        firebase_uid=firebase_uid,
        session_id=effective_session_id,
        milestone_order=req.milestone_order or 1,
        feedback_type=req.feedback_type
    )

    # Adjust learning path if feedback requests change
    path_doc = await learning_path_repository.get_by_session_id(effective_session_id)
    if path_doc and req.feedback_type in ("too_easy", "too_hard"):
        milestones = path_doc.get("milestones", [])
        for m in milestones:
            if m.get("order") == req.milestone_order:
                if req.feedback_type == "too_easy":
                    m["status"] = "completed"
                    m["reasoning"] += " (Marked as too easy by learner)"
                elif req.feedback_type == "too_hard":
                    m["estimated_hours"] = (m.get("estimated_hours") or 5) + 3
                    m["reasoning"] += " (Extended estimated hours based on learner feedback)"
        
        await learning_path_repository.upsert_learning_path(
            firebase_uid=firebase_uid,
            session_id=effective_session_id,
            career_id=path_doc.get("career_id", "data_scientist"),
            milestones=milestones
        )

    await agent_trace_repository.add_trace_event(
        firebase_uid=firebase_uid,
        session_id=effective_session_id,
        agent="Feedback Agent",
        message=f"Feedback '{req.feedback_type}' received for milestone {req.milestone_order}"
    )

    return {"status": "success", "message": "Feedback persisted and path updated if required."}

# ---------------------------------------------------------
# 6. Agent Trace Endpoint
# ---------------------------------------------------------
@app.get("/session/{session_id}/trace")
@app.get("/api/session/{session_id}/trace")
async def get_session_trace(session_id: str):
    trace = await agent_trace_repository.get_trace(session_id)
    if not trace:
        return {"session_id": session_id, "events": []}
    return trace

# ---------------------------------------------------------
# 7. Chatbot Endpoint
# ---------------------------------------------------------
@app.post("/chat")
@app.post("/api/chat")
@app.post("/api/chatbot")
@app.post("/api/chatbot/ask")
async def chat_with_assistant(
    req: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    query = req.query or req.message or ""
    context = req.user_context or {}

    if req.session_id:
        session = await session_repository.get_session(req.session_id)
        if session and session.get("assessment_result"):
            context["weak_topics"] = session["assessment_result"].get("weak_topics", [])
            context["overall_score"] = session["assessment_result"].get("overall_score", 60)

    reply = answer_user_query(query, context)
    return {"reply": reply}

# ---------------------------------------------------------
# 8. Leaderboard Endpoint
# ---------------------------------------------------------
@app.get("/api/leaderboard")
async def get_leaderboard():
    users = [
        {"rank": 1, "name": "Elena Rostova", "xp": 2850, "streak": 14, "badges": 8, "career": "Data Scientist", "is_current": False},
        {"rank": 2, "name": "Alex Chen", "xp": 2620, "streak": 11, "badges": 7, "career": "AI Engineer", "is_current": False},
        {"rank": 3, "name": "Sarah Jenkins", "xp": 2410, "streak": 9, "badges": 6, "career": "Full Stack Developer", "is_current": False},
        {"rank": 4, "name": "Dev User (You)", "xp": 2250, "streak": 7, "badges": 5, "career": "Data Scientist", "is_current": True},
        {"rank": 5, "name": "Marcus Vance", "xp": 1980, "streak": 5, "badges": 4, "career": "AI/ML Engineer", "is_current": False},
    ]
    return users

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
