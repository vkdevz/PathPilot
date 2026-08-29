from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.progress import ProgressLogRequest, ProgressResponse, HeatmapDay
from app.services.progress_service import ProgressService

router = APIRouter(prefix="/progress", tags=["Progress & Activity Tracking"])

@router.post("/log", response_model=ProgressResponse)
async def log_activity(
    req: ProgressLogRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Logs study time spent on a resource and awards XP.
    """
    progress_service = ProgressService(db)
    log = await progress_service.log_activity(
        user_id=current_user.id,
        resource_id=req.resource_id,
        minutes=req.time_spent_minutes,
        status=req.status
    )
    return log

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
