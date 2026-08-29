from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.skill import SkillResponse, LearnerSkillResponse
from app.services.skill_service import SkillService

router = APIRouter(prefix="/skills", tags=["Skills & Competency"])

@router.get("", response_model=List[SkillResponse])
async def list_skills(db: AsyncSession = Depends(get_db)):
    """
    Returns the complete platform skill taxonomy and prerequisites.
    """
    skill_service = SkillService(db)
    skills = await skill_service.get_all_skills()
    result = []
    for sk in skills:
        prereqs = [p.prerequisite_skill_id for p in sk.prerequisites]
        result.append(SkillResponse(
            id=sk.id,
            slug=sk.slug,
            name=sk.name,
            category=sk.category,
            difficulty=sk.difficulty,
            level=sk.level,
            description=sk.description,
            estimated_minutes=sk.estimated_minutes,
            prerequisites=prereqs
        ))
    return result

@router.get("/my-skills", response_model=List[LearnerSkillResponse])
async def get_my_skills(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Returns the authenticated learner's assessed skill levels and mastery scores.
    """
    skill_service = SkillService(db)
    learner_skills = await skill_service.get_learner_skills(current_user.id)
    return [
        LearnerSkillResponse(
            id=ls.id,
            skill_id=ls.skill_id,
            skill_slug=ls.skill.slug if ls.skill else "unknown",
            skill_name=ls.skill.name if ls.skill else "Skill",
            category=ls.skill.category if ls.skill else "General",
            score=ls.score,
            status=ls.status,
            last_assessed_at=ls.last_assessed_at
        )
        for ls in learner_skills
    ]
