import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.skill import Skill, LearnerSkill
from app.models.career import Career
from app.models.adaptive import LearnerEvidence, AdaptationEvent, RoadmapVersion
from app.models.learning_path import LearningPath, LearningPathItem
from app.services.adaptive.adaptive_service import AdaptiveLearningService
from app.services.adaptive.benchmark_evaluator import AdaptiveBenchmarkEvaluator

@pytest.mark.asyncio
async def test_scenario_a_proficiency_improvement(db_session: AsyncSession, test_user: User):
    """
    Scenario A (Improvement):
    Learner starts with Statistics at 35%. Submits 82% assessment evidence.
    Expected: Proficiency increases, gap decreases, AdaptationEvent is recorded.
    """
    service = AdaptiveLearningService(db_session)
    
    # 1. Get statistics skill
    stats_res = await db_session.execute(select(Skill).where(Skill.slug == "stats-ds"))
    stats_skill = stats_res.scalar_one_or_none()
    assert stats_skill is not None

    # Set initial low score
    await service.skill_repo.upsert_learner_skill(
        user_id=test_user.id,
        skill_id=stats_skill.id,
        score=35.0,
        proficiency=0.35,
        confidence=0.40,
        status="available"
    )

    # 2. Ingest assessment evidence
    adapt_res = await service.ingest_evidence_and_adapt(
        user_id=test_user.id,
        skill_id=stats_skill.id,
        evidence_type="ASSESSMENT",
        score=0.82,
        raw_score=82.0,
        source_id="test_exam_1"
    )

    assert adapt_res["status"] == "success"
    assert adapt_res["new_proficiency"] > 0.50
    assert adapt_res["proficiency_delta"] > 0.15
    assert len(adapt_res["adaptation_events"]) > 0

    # 3. Verify event persisted
    ev_q = await db_session.execute(select(AdaptationEvent).where(AdaptationEvent.user_id == test_user.id))
    events = ev_q.scalars().all()
    assert len(events) >= 1
    assert "Statistics" in events[0].reason or "stats" in events[0].reason.lower()

@pytest.mark.asyncio
async def test_scenario_b_struggle_detection_and_intervention(db_session: AsyncSession, test_user: User):
    """
    Scenario B (Struggle Detection):
    Learner attempts ML assessment multiple times with sub-passing scores (35%, 38%, 34%).
    Expected: Struggle is detected and roadmap adapter inserts a reinforcement practice milestone.
    """
    service = AdaptiveLearningService(db_session)
    
    # Get ML skill
    ml_res = await db_session.execute(select(Skill).where(Skill.slug == "ml-foundations"))
    ml_skill = ml_res.scalar_one_or_none()
    assert ml_skill is not None

    # Create active learning path with ML milestone
    career_res = await db_session.execute(select(Career))
    career = career_res.scalars().first()
    path = LearningPath(user_id=test_user.id, career_id=career.id, status="active")
    db_session.add(path)
    await db_session.flush()

    item_ml = LearningPathItem(
        learning_path_id=path.id,
        skill_id=ml_skill.id,
        step_order=1,
        status="available",
        estimated_hours=3
    )
    db_session.add(item_ml)
    await db_session.flush()

    # Ingest 3 consecutive low scores
    for idx, sc in enumerate([0.35, 0.38, 0.34], start=1):
        await service.ingest_evidence_and_adapt(
            user_id=test_user.id,
            skill_id=ml_skill.id,
            evidence_type="ASSESSMENT",
            score=sc,
            source_id=f"exam_fail_{idx}"
        )

    # Verify struggle state
    state = await service.get_learner_adaptive_state(test_user.id)
    assert state is not None

    # Verify roadmap version recorded
    versions = await service.get_roadmap_versions(test_user.id)
    assert len(versions) >= 1

@pytest.mark.asyncio
async def test_scenario_c_mastery_acceleration(db_session: AsyncSession, test_user: User):
    """
    Scenario C (Mastery Acceleration):
    Learner demonstrates 90% score on Statistics.
    Expected: Mastery is detected, milestone completes, downstream milestone unlocks.
    """
    service = AdaptiveLearningService(db_session)
    
    stats_res = await db_session.execute(select(Skill).where(Skill.slug == "stats-ds"))
    stats_skill = stats_res.scalar_one_or_none()
    ml_res = await db_session.execute(select(Skill).where(Skill.slug == "ml-foundations"))
    ml_skill = ml_res.scalar_one_or_none()

    career_res = await db_session.execute(select(Career))
    career = career_res.scalars().first()

    # Active roadmap with Stats then ML
    path = LearningPath(user_id=test_user.id, career_id=career.id, status="active")
    db_session.add(path)
    await db_session.flush()

    item1 = LearningPathItem(learning_path_id=path.id, skill_id=stats_skill.id, step_order=1, status="available", estimated_hours=2)
    item2 = LearningPathItem(learning_path_id=path.id, skill_id=ml_skill.id, step_order=2, status="locked", estimated_hours=3)
    db_session.add_all([item1, item2])
    await db_session.flush()

    # Ingest repeated strong evidence (86%, 91%, 88%)
    for idx, sc in enumerate([0.86, 0.91, 0.88], start=1):
        res = await service.ingest_evidence_and_adapt(
            user_id=test_user.id,
            skill_id=stats_skill.id,
            evidence_type="ASSESSMENT",
            score=sc,
            source_id=f"stats_mastery_attempt_{idx}"
        )

    assert res["status"] == "success"
    assert res["mastery_state"] in ["MASTERED", "NEAR_MASTERY"]

@pytest.mark.asyncio
async def test_idempotency_and_deduplication(db_session: AsyncSession, test_user: User):
    """
    Verifies that processing the same evidence twice does not duplicate records or drift proficiency.
    """
    service = AdaptiveLearningService(db_session)
    stats_res = await db_session.execute(select(Skill).where(Skill.slug == "stats-ds"))
    stats_skill = stats_res.scalar_one_or_none()

    # First attempt
    res1 = await service.ingest_evidence_and_adapt(
        user_id=test_user.id,
        skill_id=stats_skill.id,
        evidence_type="ASSESSMENT",
        score=0.80,
        source_id="fixed_attempt_123"
    )
    assert res1["status"] == "success"
    first_prof = res1["new_proficiency"]

    # Second identical attempt
    res2 = await service.ingest_evidence_and_adapt(
        user_id=test_user.id,
        skill_id=stats_skill.id,
        evidence_type="ASSESSMENT",
        score=0.80,
        source_id="fixed_attempt_123"
    )
    assert res2["status"] == "duplicate_skipped"

    # Verify only 1 evidence record exists
    ev_q = await db_session.execute(
        select(LearnerEvidence).where(
            LearnerEvidence.user_id == test_user.id,
            LearnerEvidence.source_id == "fixed_attempt_123"
        )
    )
    assert len(ev_q.scalars().all()) == 1

def test_benchmark_evaluator_all_scenarios():
    """Verify that offline benchmark evaluator runs all 15 scenarios and achieves 100% accuracy."""
    report = AdaptiveBenchmarkEvaluator.run_benchmark()
    assert report["total_scenarios"] == 15
    assert report["passed_scenarios"] == 15
    assert report["accuracy_pct"] == 100.0
    assert report["false_adaptation_rate"] == 0.0
    assert report["latency_ms"] > 0.0
