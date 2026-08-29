from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.progress import LeaderboardUserResponse
from app.services.progress_service import ProgressService

router = APIRouter(prefix="/analytics", tags=["Analytics & Leaderboard"])

@router.get("/leaderboard", response_model=List[LeaderboardUserResponse])
async def get_leaderboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns live guild leaderboard standings calculated from PostgreSQL learner profile XP.
    """
    progress_service = ProgressService(db)
    return await progress_service.get_leaderboard(current_user_id=current_user.id)
