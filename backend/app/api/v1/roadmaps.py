from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.learning_path import LearningPathResponse, LearningPathItemResponse
from app.schemas.resource import ResourceResponse
from app.services.roadmap_service import RoadmapService

router = APIRouter(prefix="/roadmaps", tags=["Personalized Learning Roadmaps"])

@router.get("/current", response_model=LearningPathResponse)
async def get_current_roadmap(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Returns the authenticated learner's active step-by-step milestone roadmap.
    """
    roadmap_service = RoadmapService(db)
    path = await roadmap_service.get_current_roadmap(current_user.id)
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active learning roadmap found. Complete a diagnostic assessment to generate your path."
        )

    milestones_resp = []
    for item in sorted(path.items, key=lambda x: x.step_order):
        res_dto = None
        if item.resource:
            res_dto = ResourceResponse(
                id=item.resource.id,
                slug=item.resource.slug,
                title=item.resource.title,
                description=item.resource.description,
                resource_type=item.resource.resource_type,
                url=item.resource.url,
                difficulty=item.resource.difficulty,
                estimated_minutes=item.resource.estimated_minutes,
                provider=item.resource.provider,
                is_interactive=item.resource.is_interactive,
                skills_taught=[]
            )

        milestones_resp.append(LearningPathItemResponse(
            id=item.id,
            step_order=item.step_order,
            skill_id=item.skill_id,
            skill_slug=item.skill.slug if item.skill else "skill",
            skill_name=item.skill.name if item.skill else "Skill",
            category=item.skill.category if item.skill else "Core",
            status=item.status,
            recommendation_reason=item.recommendation_reason,
            estimated_hours=item.estimated_hours,
            resource=res_dto,
            completed_at=item.completed_at
        ))

    return LearningPathResponse(
        id=path.id,
        user_id=path.user_id,
        career_id=path.career_id,
        career_name=path.career.name if path.career else "Career Track",
        status=path.status,
        milestones=milestones_resp,
        created_at=path.created_at,
        updated_at=path.updated_at
    )

@router.post("/milestones/{milestone_id}/complete", response_model=LearningPathItemResponse)
async def complete_milestone(
    milestone_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Marks a milestone as completed and unlocks the next milestone in sequence.
    """
    roadmap_service = RoadmapService(db)
    completed_item = await roadmap_service.complete_milestone(current_user.id, milestone_id)
    if not completed_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found or does not belong to your active roadmap."
        )

    return LearningPathItemResponse(
        id=completed_item.id,
        step_order=completed_item.step_order,
        skill_id=completed_item.skill_id,
        skill_slug=completed_item.skill.slug if completed_item.skill else "skill",
        skill_name=completed_item.skill.name if completed_item.skill else "Skill",
        category=completed_item.skill.category if completed_item.skill else "Core",
        status=completed_item.status,
        recommendation_reason=completed_item.recommendation_reason,
        estimated_hours=completed_item.estimated_hours,
        completed_at=completed_item.completed_at
    )
