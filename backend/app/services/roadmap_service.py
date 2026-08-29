from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.career_repository import CareerRepository
from app.models.learning_path import LearningPath, LearningPathItem

class RoadmapService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.learning_path_repo = LearningPathRepository(db)
        self.career_repo = CareerRepository(db)

    async def get_current_roadmap(self, user_id: str) -> Optional[LearningPath]:
        return await self.learning_path_repo.get_active_by_user(user_id)

    async def complete_milestone(self, user_id: str, milestone_id: str) -> Optional[LearningPathItem]:
        active_path = await self.learning_path_repo.get_active_by_user(user_id)
        if not active_path:
            return None

        # Verify ownership
        matching_item = next((item for item in active_path.items if item.id == milestone_id), None)
        if not matching_item:
            return None

        matching_item.status = "completed"
        
        # Unlock next milestone in sequence
        next_item = next((item for item in active_path.items if item.step_order == matching_item.step_order + 1), None)
        if next_item and next_item.status == "locked":
            next_item.status = "available"

        await self.db.flush()
        return matching_item
