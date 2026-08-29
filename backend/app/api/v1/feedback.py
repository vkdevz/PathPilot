from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.feedback import FeedbackCreateRequest, FeedbackResponse
from app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/feedback", tags=["Learner Feedback & Adaptation"])

@router.post("", response_model=FeedbackResponse)
async def submit_feedback(
    req: FeedbackCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submits milestone feedback ('too_easy', 'too_hard', 'useful', 'not_useful') and triggers adaptive path calibration.
    """
    feedback_service = FeedbackService(db)
    record = await feedback_service.submit_feedback(
        user_id=current_user.id,
        feedback_type=req.feedback_type,
        learning_path_item_id=req.learning_path_item_id,
        notes=req.notes
    )
    return record
