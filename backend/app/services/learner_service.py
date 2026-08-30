from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.repositories.career_repository import CareerRepository
from app.models.user import User, LearnerProfile

from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.resource_repository import ResourceRepository
from app.models.learning_path import LearningPath, LearningPathItem
from sqlalchemy import delete

class LearnerService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.career_repo = CareerRepository(db)
        self.learning_path_repo = LearningPathRepository(db)
        self.resource_repo = ResourceRepository(db)

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
        
        # 1. Update LearnerProfile
        profile = await self.user_repo.update_profile(user_id, {"target_career_id": career.id})
        
        # 2. Transactionally update LearningPath.career_id and milestones
        active_path = await self.learning_path_repo.get_active_by_user(user_id)
        if active_path:
            active_path.career_id = career.id
            await self.db.execute(
                delete(LearningPathItem).where(LearningPathItem.learning_path_id == active_path.id)
            )
            target_path_id = active_path.id
        else:
            new_path = LearningPath(user_id=user_id, career_id=career.id, status="active")
            await self.learning_path_repo.create(new_path)
            target_path_id = new_path.id

        # Populate milestones for the selected career
        career_skills = sorted(career.career_skills, key=lambda cs: cs.recommended_order)
        for idx, cs in enumerate(career_skills, start=1):
            sk = cs.skill
            matching_resources = await self.resource_repo.get_by_skill_id(sk.id)
            res_id = matching_resources[0].id if matching_resources else None
            item = LearningPathItem(
                learning_path_id=target_path_id,
                skill_id=sk.id,
                resource_id=res_id,
                step_order=idx,
                status="available" if idx == 1 else "locked",
                recommendation_reason=f"Core milestone in recommended learning progression for {career.name}.",
                estimated_hours=max(1, round(sk.estimated_minutes / 60))
            )
            self.db.add(item)

        await self.db.flush()
        return profile

    async def award_xp(self, user_id: str, amount: int) -> Optional[LearnerProfile]:
        return await self.user_repo.add_xp(user_id, amount)

