from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserSyncRequest
from app.services.learner_service import LearnerService

router = APIRouter(prefix="/auth", tags=["Authentication & User"])

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Returns the authenticated user's profile and current progression.
    """
    learner_service = LearnerService(db)
    user = await learner_service.get_user_profile(current_user.id)
    return user

@router.post("/sync", response_model=UserResponse)
async def sync_user(
    req: UserSyncRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Syncs display name and metadata from Supabase Auth into PostgreSQL.
    """
    if req.display_name:
        current_user.display_name = req.display_name
    if req.avatar_url:
        current_user.avatar_url = req.avatar_url
    await db.flush()
    learner_service = LearnerService(db)
    return await learner_service.get_user_profile(current_user.id)
