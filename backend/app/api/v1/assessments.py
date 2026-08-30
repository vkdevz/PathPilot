from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.assessment import (
    AssessmentDetailResponse,
    QuestionResponse,
    AssessmentSubmitRequest,
    AssessmentResultResponse,
)
from app.services.assessment_service import AssessmentService

router = APIRouter(prefix="/assessments", tags=["Assessments & Diagnostic Quizzes"])

@router.get("/latest", response_model=AssessmentResultResponse)
async def get_latest_assessment(
    career_slug: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the latest diagnostic assessment results for the authenticated learner.
    """
    assessment_service = AssessmentService(db)
    attempt = await assessment_service.get_latest_attempt(current_user.id, career_slug=career_slug)
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No diagnostic assessment results found for this learner."
        )
    return attempt

@router.get("/{career_slug}", response_model=AssessmentDetailResponse)
async def get_assessment(
    career_slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns diagnostic assessment questions tailored to the requested career track.
    """
    assessment_service = AssessmentService(db)
    assessment = await assessment_service.get_assessment_for_career(career_slug)
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No assessment found for career track '{career_slug}'."
        )

    q_list = []
    for q in assessment.questions:
        q_list.append(QuestionResponse(
            id=q.id,
            skill_id=q.skill_id,
            skill_name=q.skill.name if q.skill else None,
            difficulty=q.difficulty,
            question_text=q.question_text,
            options=q.options
        ))

    return AssessmentDetailResponse(
        id=assessment.id,
        career_id=assessment.career_id,
        career_name=assessment.career.name if assessment.career else "Career Track",
        career_slug=career_slug,
        title=assessment.title,
        total_questions=len(q_list),
        questions=q_list
    )

@router.post("/submit", response_model=AssessmentResultResponse)
async def submit_assessment(
    req: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Evaluates quiz answers, updates learner skill scores, generates a personalized roadmap, and awards XP.
    """
    assessment_service = AssessmentService(db)
    result = await assessment_service.evaluate_and_submit(
        user_id=current_user.id,
        career_slug=req.career_slug,
        answers=req.answers
    )
    return result
