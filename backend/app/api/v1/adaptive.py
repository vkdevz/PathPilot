from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.adaptive.adaptive_service import AdaptiveLearningService
from app.services.adaptive.feedback_processor import FeedbackProcessor
from app.services.adaptive.benchmark_evaluator import AdaptiveBenchmarkEvaluator
from app.repositories.recommendation_repository import RecommendationRepository
from app.schemas.adaptive import (
    EvidenceSubmission,
    FeedbackInterpretationRequest,
    AdaptationEventResponse,
    LearnerAdaptiveStateResponse,
    ProgressHistoryPoint,
    RoadmapVersionResponse,
)

router = APIRouter(prefix="/learners/me", tags=["Adaptive Learning Engine"])

@router.get("/state", response_model=LearnerAdaptiveStateResponse)
async def get_adaptive_state(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve consolidated adaptive state profile for authenticated learner.
    """
    service = AdaptiveLearningService(db)
    state = await service.get_learner_adaptive_state(current_user.id)
    if "error" in state:
        raise HTTPException(status_code=404, detail=state["error"])
    return state

@router.get("/adaptations", response_model=List[AdaptationEventResponse])
async def get_adaptations(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve recent adaptation events and XAI reasons.
    """
    service = AdaptiveLearningService(db)
    return await service.get_adaptation_timeline(current_user.id, limit=limit)

@router.get("/adaptation/timeline", response_model=List[AdaptationEventResponse])
async def get_timeline(
    limit: int = 25,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve chronological timeline of adaptations.
    """
    service = AdaptiveLearningService(db)
    return await service.get_adaptation_timeline(current_user.id, limit=limit)

@router.get("/progress-history", response_model=List[ProgressHistoryPoint])
async def get_progress_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve chronological skill proficiency progression history for visualization.
    """
    service = AdaptiveLearningService(db)
    return await service.get_progress_history(current_user.id)

@router.get("/recommendation-history")
async def get_recommendation_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve persisted recommendation telemetry and prior Next Best Action logs.
    """
    rec_repo = RecommendationRepository(db)
    feedback_list = await rec_repo.get_feedback_by_user(current_user.id)
    latest_log = await rec_repo.get_latest_recommendation_log(current_user.id)
    return {
        "latest_recommendation": {
            "id": latest_log.id,
            "algorithm_version": latest_log.algorithm_version,
            "latency_ms": latest_log.latency_ms,
            "intra_list_diversity": latest_log.intra_list_diversity,
            "recommended_resource_ids": latest_log.recommended_resource_ids
        } if latest_log else None,
        "historical_feedback": [
            {
                "id": f.id,
                "resource_id": f.resource_id,
                "feedback_type": f.feedback_type,
                "rating": f.rating,
                "created_at": f.created_at.isoformat() if f.created_at else None
            }
            for f in feedback_list
        ]
    }

@router.post("/evidence")
async def submit_learning_evidence(
    payload: EvidenceSubmission,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest learning evidence and trigger closed-loop state adaptation.
    """
    service = AdaptiveLearningService(db)
    result = await service.ingest_evidence_and_adapt(
        user_id=current_user.id,
        skill_id=payload.skill_id,
        evidence_type=payload.evidence_type,
        score=payload.score,
        raw_score=payload.raw_score,
        source_id=payload.source_id,
        metadata=payload.metadata
    )
    return result

@router.post("/feedback/interpret")
async def interpret_feedback(
    payload: FeedbackInterpretationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Classify qualitative natural-language feedback into structured pedagogical signals.
    """
    classification = FeedbackProcessor.classify_natural_language_feedback(payload.comment)
    return classification

@router.get("/roadmap/versions", response_model=List[RoadmapVersionResponse])
async def get_roadmap_versions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve versioned roadmap history.
    """
    service = AdaptiveLearningService(db)
    return await service.get_roadmap_versions(current_user.id)

@router.get("/adaptation/benchmark")
async def run_adaptation_benchmark():
    """
    Execute automated 15-scenario evaluation comparing Static vs Adaptive Personalization.
    """
    return AdaptiveBenchmarkEvaluator.run_benchmark()
