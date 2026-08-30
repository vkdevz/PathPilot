from typing import List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.models.progress import Progress, StudySession
from app.models.resource import Resource, ResourceSkill
from sqlalchemy.orm import selectinload

class ProgressRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Study Sessions (Manual Effort Logs) ──
    async def create_study_session(self, session: StudySession) -> StudySession:
        self.db.add(session)
        await self.db.flush()
        return session

    async def get_study_sessions(self, user_id: str, limit: int = 50) -> List[StudySession]:
        stmt = (
            select(StudySession)
            .options(selectinload(StudySession.resource))
            .where(StudySession.user_id == user_id)
            .order_by(desc(StudySession.session_date), desc(StudySession.created_at))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_study_sessions_in_range(self, user_id: str, since: datetime) -> List[StudySession]:
        stmt = (
            select(StudySession)
            .where(StudySession.user_id == user_id, StudySession.session_date >= since)
            .order_by(desc(StudySession.session_date))
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_all_study_sessions(self, user_id: str) -> List[StudySession]:
        stmt = select(StudySession).where(StudySession.user_id == user_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    # ── Verified Completed Learning ──
    async def get_completed_by_resource(self, user_id: str, resource_id: str) -> Optional[Progress]:
        stmt = (
            select(Progress)
            .options(
                selectinload(Progress.resource).selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill)
            )
            .where(Progress.user_id == user_id, Progress.resource_id == resource_id, Progress.status == "completed")
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def log_progress(self, progress: Progress) -> Progress:
        self.db.add(progress)
        await self.db.flush()
        return progress

    async def create_progress(self, progress: Progress) -> Progress:
        return await self.log_progress(progress)

    async def get_user_progress(self, user_id: str, limit: int = 50) -> List[Progress]:
        stmt = (
            select(Progress)
            .options(
                selectinload(Progress.resource).selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill)
            )
            .where(Progress.user_id == user_id)
            .order_by(desc(Progress.created_at))
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
            .order_by(desc(Progress.completed_at), desc(Progress.created_at))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_user_activity_days(self, user_id: str, days: int = 28) -> List[Progress]:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        stmt = select(Progress).where(Progress.user_id == user_id, Progress.created_at >= since)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
