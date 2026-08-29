from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.skill_repository import SkillRepository
from app.models.skill import Skill, LearnerSkill

class SkillService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.skill_repo = SkillRepository(db)

    async def get_all_skills(self) -> List[Skill]:
        return await self.skill_repo.get_all()

    async def get_skill_by_slug(self, slug: str) -> Optional[Skill]:
        return await self.skill_repo.get_by_slug(slug)

    async def get_learner_skills(self, user_id: str) -> List[LearnerSkill]:
        return await self.skill_repo.get_learner_skills(user_id)
