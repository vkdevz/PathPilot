from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.schemas.career import CareerResponse, CareerDetailResponse
from app.schemas.skill import SkillResponse
from app.services.career_service import CareerService

router = APIRouter(prefix="/careers", tags=["Career Tracks"])

@router.get("", response_model=List[CareerResponse])
async def list_careers(
    category: Optional[str] = Query(None, description="Filter by career category"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns all supported career tracks with market demand indicators.
    """
    career_service = CareerService(db)
    careers = await career_service.get_all_careers(category=category)
    result = []
    for c in careers:
        result.append(CareerResponse(
            id=c.id,
            slug=c.slug,
            name=c.name,
            category=c.category,
            description=c.description,
            icon=c.icon,
            market_demand_score=c.market_demand_score,
            salary_range=c.salary_range,
            total_skills=len(c.career_skills)
        ))
    return result

@router.get("/{slug}", response_model=CareerDetailResponse)
async def get_career_details(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Returns structured details and required skill tree for a specific career track.
    """
    career_service = CareerService(db)
    career = await career_service.get_career_by_slug(slug)
    if not career:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Career '{slug}' not found.")

    skills_list = []
    weights_map = {}
    for cs in sorted(career.career_skills, key=lambda x: x.recommended_order):
        sk = cs.skill
        prereqs = [p.prerequisite_skill_id for p in sk.prerequisites]
        skills_list.append(SkillResponse(
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
        weights_map[sk.slug] = cs.weight

    return CareerDetailResponse(
        id=career.id,
        slug=career.slug,
        name=career.name,
        category=career.category,
        description=career.description,
        icon=career.icon,
        market_demand_score=career.market_demand_score,
        salary_range=career.salary_range,
        skills=skills_list,
        skill_weights=weights_map
    )
