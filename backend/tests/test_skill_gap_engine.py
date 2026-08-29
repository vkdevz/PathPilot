import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.skill_gap.gap_engine import SkillGapEngine
from app.models.skill import LearnerSkill

@pytest.mark.asyncio
async def test_proficiency_normalization_and_evidence():
    # Normalization
    assert SkillGapEngine.normalize_proficiency(85.0) == 0.85
    assert SkillGapEngine.normalize_proficiency(0.0) == 0.0
    assert SkillGapEngine.normalize_proficiency(100.0) == 1.0
    assert SkillGapEngine.to_display_score(0.85) == 85.0

    engine = SkillGapEngine(None)

    # Assessment evidence
    ls_ass = LearnerSkill(
        user_id="u1", skill_id="s1", score=80.0,
        proficiency=0.80, confidence=0.90, evidence_source="assessment"
    )
    prof, conf, src, conflict = engine.resolve_learner_proficiency(ls_ass)
    assert prof == 0.80
    assert conf == 0.90
    assert src == "assessment"
    assert conflict is False

    # Conflicting evidence resolution
    ls_conflict = LearnerSkill(
        user_id="u1", skill_id="s1", score=35.0,
        assessment_score=35.0, self_reported_score=90.0, evidence_source="assessment"
    )
    prof_c, conf_c, src_c, has_conflict = engine.resolve_learner_proficiency(ls_conflict)
    assert has_conflict is True
    # Assessment should dominate weighted resolution
    assert prof_c < 0.60
    assert src_c == "assessment_calibrated"

@pytest.mark.asyncio
async def test_skill_gap_engine_analysis(db_session: AsyncSession, test_user):
    from app.repositories.skill_repository import SkillRepository
    from app.repositories.career_repository import CareerRepository

    skill_repo = SkillRepository(db_session)
    career_repo = CareerRepository(db_session)

    career = await career_repo.get_by_slug("data-scientist")
    assert career is not None

    python_sk = await skill_repo.get_by_slug("python-ds")
    sql_sk = await skill_repo.get_by_slug("sql-ds")
    data_sk = await skill_repo.get_by_slug("data-analysis")
    stats_sk = await skill_repo.get_by_slug("stats-ds")
    ml_sk = await skill_repo.get_by_slug("ml-foundations")

    # Seed learner skills: Python 90%, SQL 85%, Data Analysis 85%, Stats 30%, ML 30%
    await skill_repo.upsert_learner_skill(
        user_id=test_user.id,
        skill_id=python_sk.id,
        score=90.0,
        proficiency=0.90,
        confidence=0.90,
        evidence_source="assessment",
        status="mastered"
    )
    await skill_repo.upsert_learner_skill(
        user_id=test_user.id,
        skill_id=sql_sk.id,
        score=85.0,
        proficiency=0.85,
        confidence=0.90,
        evidence_source="assessment",
        status="mastered"
    )
    await skill_repo.upsert_learner_skill(
        user_id=test_user.id,
        skill_id=data_sk.id,
        score=85.0,
        proficiency=0.85,
        confidence=0.90,
        evidence_source="assessment",
        status="mastered"
    )
    await skill_repo.upsert_learner_skill(
        user_id=test_user.id,
        skill_id=stats_sk.id,
        score=30.0,
        proficiency=0.30,
        confidence=0.90,
        evidence_source="assessment",
        status="in_progress"
    )
    await skill_repo.upsert_learner_skill(
        user_id=test_user.id,
        skill_id=ml_sk.id,
        score=30.0,
        proficiency=0.30,
        confidence=0.90,
        evidence_source="assessment",
        status="in_progress"
    )


    engine = SkillGapEngine(db_session)
    summary = await engine.analyze_learner_gaps(
        user_id=test_user.id,
        target_career_id_or_slug="data-scientist"
    )

    assert summary.career_slug == "data-scientist"
    assert summary.career_readiness_score > 0
    assert len(summary.skill_gaps) > 0

    # Bottleneck detection: Stats should be identified as a bottleneck
    bottleneck_slugs = [b.skill_slug for b in summary.bottlenecks]
    assert "stats-ds" in bottleneck_slugs

    # Next best skill should be stats-ds
    assert summary.next_best_skill is not None
    assert summary.next_best_skill.skill_slug == "stats-ds"
    assert summary.next_best_skill.is_bottleneck is True
    assert "Statistics" in summary.next_best_skill.reason or "prerequisite" in summary.next_best_skill.reason.lower()
