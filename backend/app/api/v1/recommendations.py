import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.recommendation import RecommendationFeedback
from app.schemas.resource import ResourceResponse
from app.schemas.recommendation import (
    PersonalizedRecommendationItem,
    NextBestActionResponse,
    RecommendationFeedbackCreate,
    RecommendationFeedbackResponse,
    RecommendationObservabilityResponse,
    RecommendationEvaluationReport
)
from app.repositories.resource_repository import ResourceRepository
from app.repositories.recommendation_repository import RecommendationRepository
from app.services.recommendation.recommendation_engine import HybridRecommendationEngine, DEFAULT_WEIGHTS
from app.services.recommendation.recommendation_evaluator import RecommendationEvaluator

logger = logging.getLogger("pathpilot.api.recommendations")

router = APIRouter(tags=["Recommendations & Resources"])

@router.get("/resources", response_model=List[ResourceResponse])
async def list_resources(
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns platform learning resources (courses, projects, labs, articles).
    """
    resource_repo = ResourceRepository(db)
    resources = await resource_repo.get_all(resource_type=resource_type)
    result = []
    for r in resources:
        skills = [rs.skill.name for rs in r.resource_skills if rs.skill]
        result.append(ResourceResponse(
            id=r.id,
            slug=r.slug,
            title=r.title,
            description=r.description,
            resource_type=r.resource_type,
            url=r.url,
            difficulty=r.difficulty,
            estimated_minutes=r.estimated_minutes,
            provider=r.provider,
            is_interactive=r.is_interactive,
            content=r.content,
            skills_taught=skills
        ))
    return result

@router.get("/resources/{resource_id}", response_model=ResourceResponse)
async def get_resource_detail(
    resource_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns full details for a learning resource by ID or slug.
    """
    resource_repo = ResourceRepository(db)
    r = await resource_repo.get_by_id_or_slug(resource_id)
    if not r:
        raise HTTPException(status_code=404, detail=f"Resource '{resource_id}' not found.")
    
    skills = [rs.skill.name for rs in r.resource_skills if rs.skill]
    return ResourceResponse(
        id=r.id,
        slug=r.slug,
        title=r.title,
        description=r.description,
        resource_type=r.resource_type,
        url=r.url,
        difficulty=r.difficulty,
        estimated_minutes=r.estimated_minutes,
        provider=r.provider,
        is_interactive=r.is_interactive,
        content=r.content,
        skills_taught=skills
    )


@router.get("/recommendations", response_model=List[PersonalizedRecommendationItem])
async def get_personalized_recommendations(
    limit: int = Query(10, ge=1, le=50, description="Max recommendations to return"),
    resource_type: Optional[str] = Query(None, description="Filter by resource format"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns personalized, explainable learning recommendations computed by the Hybrid AI Recommendation Engine.
    Combines learner skill state, target career, prerequisite graph DAG, pgvector semantic search, and MMR diversity.
    """
    engine = HybridRecommendationEngine(db)
    return await engine.get_recommendations(
        user_id=current_user.id,
        limit=limit,
        resource_type=resource_type,
        difficulty=difficulty,
        persist_log=True
    )

@router.get("/recommendations/next-best-action", response_model=Optional[NextBestActionResponse])
async def get_next_best_learning_action(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the single highest-confidence #1 Next Best Learning Action for the learner's dashboard hero.
    """
    engine = HybridRecommendationEngine(db)
    action = await engine.get_next_best_action(user_id=current_user.id)
    if not action:
        raise HTTPException(status_code=404, detail="No active learning action found")
    return action

@router.post("/recommendations/feedback", response_model=RecommendationFeedbackResponse)
async def record_recommendation_feedback(
    payload: RecommendationFeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Records explicit learner interaction and feedback on recommended resources.
    """
    rec_repo = RecommendationRepository(db)
    fb = RecommendationFeedback(
        user_id=current_user.id,
        resource_id=payload.resource_id,
        feedback_type=payload.feedback_type,
        rating=payload.rating,
        notes=payload.notes
    )
    saved = await rec_repo.record_feedback(fb)
    await db.commit()

    return RecommendationFeedbackResponse(
        id=saved.id,
        resource_id=saved.resource_id,
        feedback_type=saved.feedback_type,
        status="success",
        message="Recommendation feedback successfully recorded."
    )

@router.get("/recommendations/observability", response_model=RecommendationObservabilityResponse)
async def get_recommendation_observability(
    db: AsyncSession = Depends(get_db)
):
    """
    Returns recommendation engine health, active feature weights, and telemetry statistics.
    """
    rec_repo = RecommendationRepository(db)
    stats = await rec_repo.get_stats()
    return RecommendationObservabilityResponse(
        algorithm_version=stats["algorithm_version"],
        engine_health="healthy",
        weights_configuration=DEFAULT_WEIGHTS,
        total_recommendation_runs=stats["total_recommendation_runs"],
        avg_latency_ms=stats["avg_latency_ms"],
        avg_intra_list_diversity=stats["avg_intra_list_diversity"],
        total_feedbacks_recorded=stats["total_feedbacks_recorded"]
    )

@router.get("/recommendations/evaluate", response_model=RecommendationEvaluationReport)
async def evaluate_recommendation_engine(
    k: int = Query(5, ge=1, le=20, description="Top-K cutoff for evaluation metrics"),
    db: AsyncSession = Depends(get_db)
):
    """
    Executes automated offline recommendation benchmark comparing Hybrid AI against standard baselines.
    """
    evaluator = RecommendationEvaluator(db)
    report = await evaluator.evaluate_suite(k=k)
    return RecommendationEvaluationReport(**report)
