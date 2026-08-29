import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies.auth import get_current_user_optional, get_current_user
from app.models.user import User
from app.services.retrieval_service import RetrievalService
from app.schemas.retrieval import (
    ResourceSearchRequest,
    SkillSearchRequest,
    CareerSearchRequest,
    UnifiedSearchRequest,
    UnifiedSearchResponse,
    RetrievedResourceItem,
    RetrievedSkillItem,
    RetrievedCareerItem,
    ReindexRequest,
    ReindexResponse,
    IndexStatsResponse,
    RetrievalEvaluationResponse,
)

logger = logging.getLogger("pathpilot.api.retrieval")

router = APIRouter(prefix="/retrieval", tags=["Semantic Retrieval & pgvector"])

@router.post("/semantic-search", response_model=UnifiedSearchResponse, summary="Unified Multi-Entity Semantic Search")
async def unified_semantic_search(
    request: UnifiedSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Simultaneously retrieves semantically matching resources, skills, and career tracks.
    """
    service = RetrievalService(db)
    response = UnifiedSearchResponse(query=request.query)

    if "resource" in request.entity_types or "resources" in request.entity_types:
        res = await service.search_resources(query=request.query, limit=request.limit)
        response.resources = [RetrievedResourceItem(**r) for r in res]

    if "skill" in request.entity_types or "skills" in request.entity_types:
        sk = await service.search_skills(query=request.query, limit=request.limit)
        response.skills = [RetrievedSkillItem(**s) for s in sk]

    if "career" in request.entity_types or "careers" in request.entity_types:
        car = await service.search_careers(query=request.query, limit=request.limit)
        response.careers = [RetrievedCareerItem(**c) for c in car]

    return response

@router.post("/resources", response_model=List[RetrievedResourceItem], summary="Semantic Resource Search with Metadata Filters")
async def search_resources(
    request: ResourceSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Retrieves learning resources using vector similarity combined with structured relational filters
    (difficulty, resource_type, skill_ids, max_minutes, provider, interactive).
    """
    service = RetrievalService(db)
    results = await service.search_resources(
        query=request.query,
        resource_types=request.resource_types,
        difficulties=request.difficulties,
        skill_ids=request.skill_ids,
        max_minutes=request.max_minutes,
        min_similarity=request.min_similarity,
        provider=request.provider,
        is_interactive=request.is_interactive,
        limit=request.limit
    )
    return [RetrievedResourceItem(**r) for r in results]

@router.post("/skills", response_model=List[RetrievedSkillItem], summary="Semantic Skill Search")
async def search_skills(
    request: SkillSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Retrieves skills using semantic search with optional category and difficulty filtering.
    """
    service = RetrievalService(db)
    results = await service.search_skills(
        query=request.query,
        categories=request.categories,
        difficulties=request.difficulties,
        min_level=request.min_level,
        max_level=request.max_level,
        min_similarity=request.min_similarity,
        limit=request.limit
    )
    return [RetrievedSkillItem(**s) for s in results]

@router.post("/careers", response_model=List[RetrievedCareerItem], summary="Semantic Career Search")
async def search_careers(
    request: CareerSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Retrieves career tracks using semantic search with optional category and market demand filters.
    """
    service = RetrievalService(db)
    results = await service.search_careers(
        query=request.query,
        categories=request.categories,
        min_demand=request.min_demand,
        min_similarity=request.min_similarity,
        limit=request.limit
    )
    return [RetrievedCareerItem(**c) for c in results]

@router.get("/resources/by-skill/{skill_slug}", summary="Find Resources Semantically Matched to Skill")
async def get_resources_by_skill(
    skill_slug: str,
    limit: int = Query(default=5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Retrieves resources matched to the vector embedding of a specified skill.
    """
    service = RetrievalService(db)
    return await service.find_resources_by_skill(skill_identifier=skill_slug, limit=limit)

@router.get("/stats", response_model=IndexStatsResponse, summary="Embedding Index & Vector Stats")
async def get_retrieval_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Returns vector database health, total embeddings count, breakdown by entity type, and model version.
    """
    service = RetrievalService(db)
    return await service.get_index_stats()

@router.post("/reindex", response_model=ReindexResponse, summary="Trigger Batch Embedding Generation Pipeline")
async def trigger_reindex(
    request: ReindexRequest = ReindexRequest(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Triggers incremental or forced embedding generation across resources, skills, and careers.
    Uses content-hash diffing to skip unmodified records unless force=True.
    """
    service = RetrievalService(db)
    return await service.trigger_reindex(force=request.force)

@router.get("/evaluate", response_model=RetrievalEvaluationResponse, summary="Evaluate Information Retrieval (IR) Metrics")
async def evaluate_retrieval(
    k: int = Query(default=5, ge=1, le=10),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Runs automated Information Retrieval benchmark evaluation measuring Precision@K, Recall@K, MRR, and NDCG@K.
    """
    service = RetrievalService(db)
    return await service.evaluate(k=k)
