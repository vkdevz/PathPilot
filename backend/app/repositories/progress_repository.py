from typing import List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.progress import Progress

from app.models.resource import Resource, ResourceSkill
from sqlalchemy.orm import selectinload

class ProgressRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_progress(self, progress: Progress) -> Progress:
        self.db.add(progress)
        await self.db.flush()
        return progress

    async def create_progress(self, progress: Progress) -> Progress:
        return await self.log_progress(progress)

    async def get_user_activity_days(self, user_id: str, days: int = 28) -> List[Progress]:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        stmt = select(Progress).where(Progress.user_id == user_id, Progress.created_at >= since)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_user_progress(self, user_id: str, limit: int = 50) -> List[Progress]:
        stmt = (
            select(Progress)
            .options(
                selectinload(Progress.resource).selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill)
            )
            .where(Progress.user_id == user_id)
            .order_by(Progress.created_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_completed_resources(self, user_id: str, limit: int = 50) -> List[Progress]:
        stmt = (
            select(Progress)
            .options(
                selectinload(Progress.resource).selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill)
            )
            .where(Progress.user_id == user_id, Progress.status == "completed")
            .order_by(Progress.created_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

