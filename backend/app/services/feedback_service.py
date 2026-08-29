from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.learning_path_repository import LearningPathRepository
from app.models.feedback import Feedback
from app.models.learning_path import LearningPathItem

class FeedbackService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.feedback_repo = FeedbackRepository(db)
        self.learning_path_repo = LearningPathRepository(db)

    async def submit_feedback(
        self,
        user_id: str,
        feedback_type: str,
        learning_path_item_id: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Feedback:
        feedback = Feedback(
            user_id=user_id,
            learning_path_item_id=learning_path_item_id,
            feedback_type=feedback_type,
            notes=notes
        )
        await self.feedback_repo.create(feedback)

        # Dynamic Adaptation: Alter milestone if requested
        if learning_path_item_id:
            active_path = await self.learning_path_repo.get_active_by_user(user_id)
            if active_path:
                for item in active_path.items:
                    if item.id == learning_path_item_id:
                        if feedback_type == "too_easy":
                            item.status = "completed"
                            item.recommendation_reason = (item.recommendation_reason or "") + " (Learner skipped: Marked as too easy)"
                        elif feedback_type == "too_hard":
                            item.estimated_hours = item.estimated_hours + 2
                            item.recommendation_reason = (item.recommendation_reason or "") + " (Pacing adjusted: Extra practice allocated)"

        await self.db.flush()
        return feedback
