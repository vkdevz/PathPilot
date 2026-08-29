from typing import Optional, List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.skill import Skill, SkillPrerequisite, LearnerSkill
from app.models.career import CareerSkill
from datetime import datetime, timezone

class SkillRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, active_only: bool = True) -> List[Skill]:
        stmt = (
            select(Skill)
            .options(
                selectinload(Skill.prerequisites).selectinload(SkillPrerequisite.prerequisite_skill),
                selectinload(Skill.downstream_skills).selectinload(SkillPrerequisite.target_skill),
                selectinload(Skill.resource_associations)
            )
        )
        if active_only:
            stmt = stmt.where(Skill.is_active.is_(True))
        stmt = stmt.order_by(Skill.level, Skill.name)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_slug(self, slug: str) -> Optional[Skill]:
        alt_slug = slug.replace("_", "-") if "_" in slug else slug.replace("-", "_")
        stmt = (
            select(Skill)
            .options(
                selectinload(Skill.prerequisites).selectinload(SkillPrerequisite.prerequisite_skill),
                selectinload(Skill.downstream_skills).selectinload(SkillPrerequisite.target_skill),
                selectinload(Skill.resource_associations)
            )
            .where(Skill.slug.in_([slug, alt_slug]))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, skill_id: str) -> Optional[Skill]:
        stmt = (
            select(Skill)
            .options(
                selectinload(Skill.prerequisites).selectinload(SkillPrerequisite.prerequisite_skill),
                selectinload(Skill.downstream_skills).selectinload(SkillPrerequisite.target_skill),
                selectinload(Skill.resource_associations)
            )
            .where(Skill.id == skill_id)
        )
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

    async def get_learner_skill(self, user_id: str, skill_id: str) -> Optional[LearnerSkill]:
        stmt = (
            select(LearnerSkill)
            .options(selectinload(LearnerSkill.skill))
            .where(LearnerSkill.user_id == user_id, LearnerSkill.skill_id == skill_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def upsert_learner_skill(
        self,
        user_id: str,
        skill_id: str,
        score: float,
        status: str = "in_progress",
        proficiency: Optional[float] = None,
        confidence: Optional[float] = None,
        evidence_source: str = "assessment",
        assessment_score: Optional[float] = None,
        self_reported_score: Optional[float] = None
    ) -> LearnerSkill:
        stmt = select(LearnerSkill).where(
            LearnerSkill.user_id == user_id,
            LearnerSkill.skill_id == skill_id
        )
        result = await self.db.execute(stmt)
        learner_skill = result.scalar_one_or_none()

        # Normalize score and proficiency consistently
        normalized_score = float(score)
        normalized_prof = proficiency if proficiency is not None else round(normalized_score / 100.0, 4)

        if learner_skill:
            learner_skill.score = normalized_score
            learner_skill.proficiency = normalized_prof
            learner_skill.status = status
            if confidence is not None:
                learner_skill.confidence = confidence
            if evidence_source:
                learner_skill.evidence_source = evidence_source
            if assessment_score is not None:
                learner_skill.assessment_score = assessment_score
            if self_reported_score is not None:
                learner_skill.self_reported_score = self_reported_score
            learner_skill.last_assessed_at = datetime.now(timezone.utc)
        else:
            conf = confidence if confidence is not None else (0.90 if evidence_source == "assessment" else 0.40)
            learner_skill = LearnerSkill(
                user_id=user_id,
                skill_id=skill_id,
                score=normalized_score,
                proficiency=normalized_prof,
                confidence=conf,
                evidence_source=evidence_source,
                assessment_score=assessment_score or (normalized_score if evidence_source == "assessment" else None),
                self_reported_score=self_reported_score or (normalized_score if evidence_source == "self_report" else None),
                status=status,
                last_assessed_at=datetime.now(timezone.utc)
            )
            self.db.add(learner_skill)

        await self.db.flush()
        return learner_skill
