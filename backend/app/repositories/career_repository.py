from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.career import Career, CareerSkill
from app.models.skill import Skill

class CareerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, category: Optional[str] = None) -> List[Career]:
        stmt = select(Career).options(selectinload(Career.career_skills))
        if category and category != "All Categories":
            stmt = stmt.where(Career.category == category)
        stmt = stmt.order_by(Career.name)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_slug(self, slug: str) -> Optional[Career]:
        # Handle variants (hyphen or underscore)
        alt_slug = slug.replace("_", "-") if "_" in slug else slug.replace("-", "_")
        stmt = (
            select(Career)
            .options(
                selectinload(Career.career_skills).selectinload(CareerSkill.skill).selectinload(Skill.prerequisites)
            )
            .where(Career.slug.in_([slug, alt_slug]))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, career_id: str) -> Optional[Career]:
        stmt = (
            select(Career)
            .options(
                selectinload(Career.career_skills).selectinload(CareerSkill.skill).selectinload(Skill.prerequisites)
            )
            .where(Career.id == career_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, career: Career) -> Career:
        self.db.add(career)
        await self.db.flush()
        return career
