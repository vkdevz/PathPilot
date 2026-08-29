from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.resource import Resource, ResourceSkill

class ResourceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, resource_type: Optional[str] = None) -> List[Resource]:
        stmt = select(Resource).options(selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill))
        if resource_type:
            stmt = stmt.where(Resource.resource_type == resource_type)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, resource_id: str) -> Optional[Resource]:
        stmt = (
            select(Resource)
            .options(selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill))
            .where(Resource.id == resource_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_skill_id(self, skill_id: str) -> List[Resource]:
        stmt = (
            select(Resource)
            .join(ResourceSkill, Resource.id == ResourceSkill.resource_id)
            .where(ResourceSkill.skill_id == skill_id)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
