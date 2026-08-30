from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.progress import (
    ProgressLogRequest,
    ProgressResponse,
    HeatmapDay,
    CompletedLearningItem,
    StudySessionCreateRequest,
    StudySessionResponse,
    StudyTimeSummaryResponse,
    CompleteResourceRequest,
    ResourceCompletionResponse,
)
from app.services.progress_service import ProgressService

router = APIRouter(prefix="/progress", tags=["Progress & Activity Tracking"])

# ── 1. Study Sessions (Manual Study Time) ──

@router.post("/study-sessions", response_model=StudySessionResponse)
async def log_study_session(
    req: StudySessionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually logs focused study time on a topic or resource.
    Awards session XP based on duration without creating a course completion.
    """
    progress_service = ProgressService(db)
    session = await progress_service.log_study_session(
        user_id=current_user.id,
        topic=req.topic,
        duration_minutes=req.duration_minutes,
        resource_id=req.resource_id,
        session_date=req.session_date,
        notes=req.notes
    )
    return session

@router.get("/study-sessions", response_model=List[StudySessionResponse])
async def get_study_sessions(
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns manually logged study sessions for the authenticated learner.
    """
    progress_service = ProgressService(db)
    return await progress_service.get_study_sessions(current_user.id, limit=limit)

@router.get("/summary", response_model=StudyTimeSummaryResponse)
async def get_study_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns aggregated study time metrics (Today, This Week, This Month, Total) calculated from real data.
    """
    progress_service = ProgressService(db)
    return await progress_service.get_study_time_summary(current_user.id)


# ── 2. Verified Completed Learning ──

@router.post("/complete", response_model=ResourceCompletionResponse)
async def complete_resource(
    req: CompleteResourceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Marks a resource as verified completed and authoritatively awards completion XP (idempotent).
    """
    progress_service = ProgressService(db)
    return await progress_service.complete_resource(
        user_id=current_user.id,
        resource_id=req.resource_id,
        time_spent_minutes=req.time_spent_minutes
    )

@router.get("/completed", response_model=List[CompletedLearningItem])
@router.get("/history", response_model=List[CompletedLearningItem])
async def get_completed_learning(
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the authenticated user's verified completed learning history.
    """
    progress_service = ProgressService(db)
    return await progress_service.get_completed_learning(current_user.id, limit=limit)


# ── 3. Heatmap & Legacy Logging ──

@router.get("/heatmap", response_model=List[HeatmapDay])
async def get_heatmap(
    days: int = Query(28, ge=7, le=90),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns user learning activity heatmap entries over the requested day range.
    """
    progress_service = ProgressService(db)
    return await progress_service.get_heatmap(current_user.id, days=days)

@router.post("/log", response_model=ProgressResponse)
async def log_activity(
    req: ProgressLogRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Legacy endpoint: Logs study time spent on a resource.
    """
    progress_service = ProgressService(db)
    log = await progress_service.log_activity(
        user_id=current_user.id,
        resource_id=req.resource_id,
        minutes=req.time_spent_minutes,
        status=req.status
    )
    return log
