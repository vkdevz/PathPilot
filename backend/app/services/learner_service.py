from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.repositories.career_repository import CareerRepository
from app.models.user import User, LearnerProfile

class LearnerService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.career_repo = CareerRepository(db)

    async def get_user_profile(self, user_id: str) -> Optional[User]:
        return await self.user_repo.get_by_id(user_id)

    async def update_profile(self, user_id: str, profile_data: dict) -> Optional[LearnerProfile]:
        # If target career slug is passed, convert to career_id
        if "target_career_slug" in profile_data:
            career = await self.career_repo.get_by_slug(profile_data.pop("target_career_slug"))
            if career:
                profile_data["target_career_id"] = career.id

        return await self.user_repo.update_profile(user_id, profile_data)

    async def set_target_career(self, user_id: str, career_slug: str) -> Optional[LearnerProfile]:
        career = await self.career_repo.get_by_slug(career_slug)
        if not career:
            return None
        return await self.user_repo.update_profile(user_id, {"target_career_id": career.id})

    async def award_xp(self, user_id: str, amount: int) -> Optional[LearnerProfile]:
        return await self.user_repo.add_xp(user_id, amount)
