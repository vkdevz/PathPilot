from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user import LearnerProfileResponse, LearnerProfileUpdate
from app.schemas.career import SelectCareerRequest
from app.services.learner_service import LearnerService

router = APIRouter(prefix="/profile", tags=["Learner Profile"])

@router.get("", response_model=LearnerProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Returns the authenticated user's learner profile.
    """
    learner_service = LearnerService(db)
    user = await learner_service.get_user_profile(current_user.id)
    if not user or not user.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found.")
    return user.profile

@router.patch("", response_model=LearnerProfileResponse)
async def update_profile(
    req: LearnerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates preferences, pacing, weekly goal, or experience level for the learner profile.
    """
    learner_service = LearnerService(db)
    updated = await learner_service.update_profile(current_user.id, req.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner profile not found.")
    return updated

@router.post("/career", response_model=LearnerProfileResponse)
async def set_career(
    req: SelectCareerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Selects or changes the target career track for the learner.
    """
    learner_service = LearnerService(db)
    updated = await learner_service.set_target_career(current_user.id, req.career_slug)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Career track '{req.career_slug}' not found.")
    return updated
