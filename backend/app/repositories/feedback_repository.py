from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.feedback import Feedback

class FeedbackRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, feedback: Feedback) -> Feedback:
        self.db.add(feedback)
        await self.db.flush()
        return feedback

    async def get_by_user(self, user_id: str) -> List[Feedback]:
        stmt = select(Feedback).where(Feedback.user_id == user_id).order_by(Feedback.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
