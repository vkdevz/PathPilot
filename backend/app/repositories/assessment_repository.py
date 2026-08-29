from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.assessment import Assessment, Question, AssessmentAttempt

class AssessmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_career_id(self, career_id: str) -> Optional[Assessment]:
        stmt = (
            select(Assessment)
            .options(
                selectinload(Assessment.career),
                selectinload(Assessment.questions).selectinload(Question.skill)
            )
            .where(Assessment.career_id == career_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, assessment_id: str) -> Optional[Assessment]:
        stmt = (
            select(Assessment)
            .options(
                selectinload(Assessment.career),
                selectinload(Assessment.questions).selectinload(Question.skill)
            )
            .where(Assessment.id == assessment_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_questions_by_skill_id(self, skill_id: str) -> List[Question]:
        stmt = select(Question).where(Question.skill_id == skill_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_attempt(self, attempt: AssessmentAttempt) -> AssessmentAttempt:
        self.db.add(attempt)
        await self.db.flush()
        return attempt

    async def get_attempts_by_user(self, user_id: str) -> List[AssessmentAttempt]:
        stmt = (
            select(AssessmentAttempt)
            .options(selectinload(AssessmentAttempt.assessment))
            .where(AssessmentAttempt.user_id == user_id)
            .order_by(AssessmentAttempt.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
