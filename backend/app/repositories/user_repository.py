from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.models.user import User, LearnerProfile

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: str) -> Optional[User]:
        stmt = (
            select(User)
            .options(
                selectinload(User.profile).selectinload(LearnerProfile.target_career)
            )
            .where(User.id == user_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = (
            select(User)
            .options(
                selectinload(User.profile).selectinload(LearnerProfile.target_career)
            )
            .where(User.email == email)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_profile(self, user_id: str, update_data: dict) -> Optional[LearnerProfile]:
        stmt = (
            select(LearnerProfile)
            .options(selectinload(LearnerProfile.target_career))
            .where(LearnerProfile.user_id == user_id)
        )
        result = await self.db.execute(stmt)
        profile = result.scalar_one_or_none()
        if not profile:
            return None

        for key, value in update_data.items():
            if value is not None and hasattr(profile, key):
                setattr(profile, key, value)

        await self.db.flush()
        # Refresh with relationship
        stmt_fresh = (
            select(LearnerProfile)
            .options(selectinload(LearnerProfile.target_career))
            .where(LearnerProfile.user_id == user_id)
        )
        fresh_res = await self.db.execute(stmt_fresh)
        return fresh_res.scalar_one_or_none() or profile

    async def add_xp(self, user_id: str, amount: int) -> Optional[LearnerProfile]:
        stmt = (
            select(LearnerProfile)
            .options(selectinload(LearnerProfile.target_career))
            .where(LearnerProfile.user_id == user_id)
        )
        result = await self.db.execute(stmt)
        profile = result.scalar_one_or_none()
        if profile:
            profile.xp += amount
            await self.db.flush()
        return profile

    async def get_leaderboard(self, limit: int = 20) -> List[tuple[User, LearnerProfile]]:
        stmt = (
            select(User, LearnerProfile)
            .join(LearnerProfile, User.id == LearnerProfile.user_id)
            .options(selectinload(LearnerProfile.target_career))
            .order_by(desc(LearnerProfile.xp))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.all()

