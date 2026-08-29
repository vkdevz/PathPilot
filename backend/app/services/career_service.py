from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.career_repository import CareerRepository
from app.models.career import Career

class CareerService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.career_repo = CareerRepository(db)

    async def get_all_careers(self, category: Optional[str] = None) -> List[Career]:
        return await self.career_repo.get_all(category=category)

    async def get_career_by_slug(self, slug: str) -> Optional[Career]:
        return await self.career_repo.get_by_slug(slug)

    async def get_career_by_id(self, career_id: str) -> Optional[Career]:
        return await self.career_repo.get_by_id(career_id)
