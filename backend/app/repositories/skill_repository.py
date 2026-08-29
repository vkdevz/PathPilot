from typing import Optional, List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.skill import Skill, SkillPrerequisite, LearnerSkill

class SkillRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Skill]:
        stmt = select(Skill).options(selectinload(Skill.prerequisites)).order_by(Skill.level, Skill.name)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_slug(self, slug: str) -> Optional[Skill]:
        alt_slug = slug.replace("_", "-") if "_" in slug else slug.replace("-", "_")
        stmt = select(Skill).options(selectinload(Skill.prerequisites)).where(Skill.slug.in_([slug, alt_slug]))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, skill_id: str) -> Optional[Skill]:
        stmt = select(Skill).options(selectinload(Skill.prerequisites)).where(Skill.id == skill_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_learner_skills(self, user_id: str) -> List[LearnerSkill]:
        stmt = (
            select(LearnerSkill)
            .options(selectinload(LearnerSkill.skill))
            .where(LearnerSkill.user_id == user_id)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def upsert_learner_skill(
        self,
        user_id: str,
        skill_id: str,
        score: float,
        status: str
    ) -> LearnerSkill:
        stmt = select(LearnerSkill).where(
            LearnerSkill.user_id == user_id,
            LearnerSkill.skill_id == skill_id
        )
        result = await self.db.execute(stmt)
        learner_skill = result.scalar_one_or_none()

        if learner_skill:
            learner_skill.score = score
            learner_skill.status = status
        else:
            learner_skill = LearnerSkill(
                user_id=user_id,
                skill_id=skill_id,
                score=score,
                status=status
            )
            self.db.add(learner_skill)

        await self.db.flush()
        return learner_skill
