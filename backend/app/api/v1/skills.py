from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.skill import (
    SkillResponse,
    SkillDetailResponse,
    SkillPrerequisiteNode,
    PrerequisiteGraphResponse,
    LearnerSkillResponse,
    IntelligentSkillGapResponse,
    NextBestSkillResponse,
    CareerReadinessSummaryResponse,
    GraphValidationResponse,
)
from app.services.skill_graph.graph_service import SkillGraphService
from app.services.skill_gap.gap_engine import SkillGapEngine
from app.services.skill_gap.benchmark_evaluator import SkillGapBenchmarkEvaluator

router = APIRouter(prefix="/skills", tags=["Skills & Competency"])

@router.get("", response_model=List[SkillResponse])
async def list_skills(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the complete platform skill taxonomy and prerequisites DAG.
    """
    graph_service = SkillGraphService(db)
    await graph_service.initialize()
    skills = graph_service.get_all_skills()

    if domain:
        skills = [s for s in skills if s.domain.lower() == domain.lower()]
    if category:
        skills = [s for s in skills if s.category.lower() == category.lower()]

    result = []
    for sk in skills:
        direct_prereqs = graph_service.get_direct_prerequisites(sk.id)
        downstream = graph_service.get_direct_downstream(sk.id)
        resource_count = len(sk.resource_associations) if sk.resource_associations else 0

        result.append(SkillResponse(
            id=sk.id,
            slug=sk.slug,
            name=sk.name,
            category=sk.category,
            domain=sk.domain or "General",
            difficulty=sk.difficulty or "Beginner",
            level=sk.level,
            description=sk.description,
            estimated_minutes=sk.estimated_minutes,
            is_active=sk.is_active,
            prerequisites=[p.slug for p in direct_prereqs],
            downstream_skills=[d.slug for d in downstream],
            resource_count=resource_count
        ))
    return result

@router.get("/graph/validate", response_model=GraphValidationResponse)
async def validate_skill_graph(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Administrative & developer graph validation endpoint.
    Performs cycle detection, orphan detection, and referential integrity audits.
    """
    graph_service = SkillGraphService(db)
    val_result = await graph_service.validate_graph()
    return GraphValidationResponse(
        is_valid=val_result.is_valid,
        total_skills=val_result.total_skills,
        total_edges=val_result.total_edges,
        cycles_detected=val_result.cycles_detected,
        orphan_skills=val_result.orphan_skills,
        missing_references=val_result.missing_references,
        duplicate_edges=val_result.duplicate_edges,
        inactive_skills=val_result.inactive_skills
    )

@router.get("/benchmark")
async def evaluate_skill_gap_benchmark(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Executes automated offline skill gap benchmark evaluating 10 test personas
    and baseline comparisons (Raw Gap vs Graph-Aware Engine).
    """
    evaluator = SkillGapBenchmarkEvaluator(db)
    result = await evaluator.run_benchmark()
    return {
        "total_profiles": result.total_profiles,
        "bottleneck_accuracy": f"{result.bottleneck_accuracy_pct}%",
        "prerequisite_safety": f"{result.prerequisite_safety_pct}%",
        "next_skill_correctness": f"{result.next_skill_correctness_pct}%",
        "avg_latency_ms": result.avg_latency_ms,
        "baseline_comparison": result.baseline_comparison,
        "detailed_results": result.detailed_results
    }

@router.get("/my-skills", response_model=List[LearnerSkillResponse])
async def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the authenticated learner's assessed skill levels, normalized proficiency,
    confidence score, and evidence source.
    """
    from app.repositories.skill_repository import SkillRepository
    skill_repo = SkillRepository(db)
    learner_skills = await skill_repo.get_learner_skills(current_user.id)

    return [
        LearnerSkillResponse(
            id=ls.id,
            skill_id=ls.skill_id,
            skill_slug=ls.skill.slug if ls.skill else "unknown",
            skill_name=ls.skill.name if ls.skill else "Skill",
            category=ls.skill.category if ls.skill else "General",
            domain=ls.skill.domain if ls.skill else "General",
            score=ls.score,
            proficiency=ls.proficiency or (ls.score / 100.0),
            confidence=ls.confidence or 0.5,
            evidence_source=ls.evidence_source or "self_report",
            assessment_score=ls.assessment_score,
            self_reported_score=ls.self_reported_score,
            status=ls.status,
            last_assessed_at=ls.last_assessed_at
        )
        for ls in learner_skills
    ]

@router.get("/skill-gaps", response_model=CareerReadinessSummaryResponse)
async def get_my_skill_gaps(
    career_slug: Optional[str] = Query(None, description="Optional career track override"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns full intelligent skill gap analysis, career readiness percentage,
    bottlenecks, and the authoritative Next Best Skill for the authenticated learner.
    """
    engine = SkillGapEngine(db)
    summary = await engine.analyze_learner_gaps(
        user_id=current_user.id,
        target_career_id_or_slug=career_slug
    )
    return summary

@router.get("/next-best-skill", response_model=Optional[NextBestSkillResponse])
async def get_next_best_skill(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Authoritative single #1 Next Best Skill hero recommendation.
    """
    engine = SkillGapEngine(db)
    summary = await engine.analyze_learner_gaps(user_id=current_user.id)
    return summary.next_best_skill

@router.get("/{skill_id_or_slug}", response_model=SkillDetailResponse)
async def get_skill_detail(
    skill_id_or_slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns detailed skill entity with upstream prerequisites and downstream dependents.
    """
    graph_service = SkillGraphService(db)
    await graph_service.initialize()
    skill = graph_service.get_skill(skill_id_or_slug)

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill '{skill_id_or_slug}' not found"
        )

    direct_prereqs = graph_service.get_direct_prerequisites(skill.id)
    downstream = graph_service.get_direct_downstream(skill.id)
    resource_count = len(skill.resource_associations) if skill.resource_associations else 0

    prereq_nodes = [
        SkillPrerequisiteNode(
            id=p.id,
            slug=p.slug,
            name=p.name,
            category=p.category,
            domain=p.domain or "General",
            difficulty=p.difficulty or "Beginner",
            level=p.level,
            depth=1
        )
        for p in direct_prereqs
    ]

    downstream_nodes = [
        SkillPrerequisiteNode(
            id=d.id,
            slug=d.slug,
            name=d.name,
            category=d.category,
            domain=d.domain or "General",
            difficulty=d.difficulty or "Beginner",
            level=d.level,
            depth=1
        )
        for d in downstream
    ]

    return SkillDetailResponse(
        id=skill.id,
        slug=skill.slug,
        name=skill.name,
        category=skill.category,
        domain=skill.domain or "General",
        difficulty=skill.difficulty or "Beginner",
        level=skill.level,
        description=skill.description,
        estimated_minutes=skill.estimated_minutes,
        is_active=skill.is_active,
        prerequisites=[p.slug for p in direct_prereqs],
        downstream_skills=[d.slug for d in downstream],
        resource_count=resource_count,
        prerequisite_nodes=prereq_nodes,
        downstream_nodes=downstream_nodes,
        metadata_json=skill.metadata_json or {}
    )

@router.get("/{skill_id_or_slug}/prerequisites", response_model=PrerequisiteGraphResponse)
async def get_skill_prerequisites_graph(
    skill_id_or_slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns full prerequisite DAG tree for a skill including transitive ancestors and descendants.
    """
    graph_service = SkillGraphService(db)
    await graph_service.initialize()
    skill = graph_service.get_skill(skill_id_or_slug)

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill '{skill_id_or_slug}' not found"
        )

    direct_prereqs = graph_service.get_direct_prerequisites(skill.id)
    transitive_prereqs = graph_service.get_transitive_prerequisites(skill.id)
    transitive_down = graph_service.get_transitive_downstream(skill.id)
    max_depth = graph_service.get_prerequisite_depth(skill.id)
    is_foundation = graph_service.is_foundation_skill(skill.id)

    direct_nodes = [
        SkillPrerequisiteNode(
            id=p.id,
            slug=p.slug,
            name=p.name,
            category=p.category,
            domain=p.domain or "General",
            difficulty=p.difficulty or "Beginner",
            level=p.level,
            depth=1
        )
        for p in direct_prereqs
    ]

    transitive_nodes = [
        SkillPrerequisiteNode(
            id=p.id,
            slug=p.slug,
            name=p.name,
            category=p.category,
            domain=p.domain or "General",
            difficulty=p.difficulty or "Beginner",
            level=p.level,
            depth=depth
        )
        for p, depth in transitive_prereqs
    ]

    downstream_nodes = [
        SkillPrerequisiteNode(
            id=d.id,
            slug=d.slug,
            name=d.name,
            category=d.category,
            domain=d.domain or "General",
            difficulty=d.difficulty or "Beginner",
            level=d.level,
            depth=depth
        )
        for d, depth in transitive_down
    ]

    return PrerequisiteGraphResponse(
        target_skill_id=skill.id,
        target_skill_slug=skill.slug,
        target_skill_name=skill.name,
        direct_prerequisites=direct_nodes,
        transitive_prerequisites=transitive_nodes,
        downstream_unlocked=downstream_nodes,
        max_prerequisite_depth=max_depth,
        is_foundation=is_foundation
    )
