from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.learning_path import LearningPath, LearningPathItem
from app.models.skill import Skill
from app.models.resource import Resource

class LearningPathRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_by_user(self, user_id: str) -> Optional[LearningPath]:
        stmt = (
            select(LearningPath)
            .options(
                selectinload(LearningPath.career),
                selectinload(LearningPath.items).selectinload(LearningPathItem.skill),
                selectinload(LearningPath.items).selectinload(LearningPathItem.resource)
            )
            .where(LearningPath.user_id == user_id, LearningPath.status == "active")
            .order_by(LearningPath.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, learning_path: LearningPath) -> LearningPath:
        self.db.add(learning_path)
        await self.db.flush()
        return learning_path

    async def update_item_status(self, item_id: str, status: str) -> Optional[LearningPathItem]:
        stmt = select(LearningPathItem).where(LearningPathItem.id == item_id)
        result = await self.db.execute(stmt)
        item = result.scalar_one_or_none()
        if item:
            item.status = status
            await self.db.flush()
        return item
