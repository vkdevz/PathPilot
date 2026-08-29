from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.careers import router as careers_router
from app.api.v1.skills import router as skills_router
from app.api.v1.assessments import router as assessments_router
from app.api.v1.roadmaps import router as roadmaps_router
from app.api.v1.progress import router as progress_router
from app.api.v1.feedback import router as feedback_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.chat import router as chat_router
from app.api.v1.retrieval import router as retrieval_router
from app.api.v1.adaptive import router as adaptive_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(profile_router)
api_v1_router.include_router(careers_router)
api_v1_router.include_router(skills_router)
api_v1_router.include_router(assessments_router)
api_v1_router.include_router(roadmaps_router)
api_v1_router.include_router(progress_router)
api_v1_router.include_router(feedback_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(recommendations_router)
api_v1_router.include_router(chat_router)
api_v1_router.include_router(retrieval_router)
api_v1_router.include_router(adaptive_router)
