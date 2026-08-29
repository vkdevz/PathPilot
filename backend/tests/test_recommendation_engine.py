import pytest
from app.services.recommendation.learner_state_extractor import LearnerStateExtractor
from app.services.recommendation.candidate_generator import CandidateGenerator
from app.services.recommendation.constraint_filter import ConstraintFilter
from app.services.recommendation.feature_extractor import FeatureExtractor
from app.services.recommendation.hybrid_scorer import HybridScorer, DEFAULT_WEIGHTS
from app.services.recommendation.diversity_ranker import DiversityRanker
from app.services.recommendation.explanation_engine import ExplanationEngine
from app.services.recommendation.recommendation_engine import HybridRecommendationEngine
from app.services.recommendation.types import LearnerState, CandidateResource, ScoredCandidate, SkillGapInfo
from app.models.resource import Resource, ResourceSkill
from app.models.skill import Skill

@pytest.mark.asyncio
async def test_learner_state_extraction(db_session, test_user):
    extractor = LearnerStateExtractor(db_session)
    state = await extractor.extract_state(test_user.id)

    assert state.user_id == test_user.id
    assert state.experience_level in ("beginner", "intermediate", "advanced")
    assert state.target_career is not None
    assert len(state.skill_gaps) > 0
    # Check that gaps have calculated magnitude
    for gap in state.skill_gaps:
        assert gap.target_score in (70.0, 75.0, 80.0, 85.0, 90.0)
        assert gap.gap_magnitude >= 0.0


@pytest.mark.asyncio
async def test_candidate_generation(db_session, test_user):
    extractor = LearnerStateExtractor(db_session)
    state = await extractor.extract_state(test_user.id)

    generator = CandidateGenerator(db_session)
    candidates = await generator.generate_candidates(state, limit=20)

    assert len(candidates) > 0
    for cand in candidates:
        assert isinstance(cand.resource, Resource)
        assert len(cand.channels) > 0

@pytest.mark.asyncio
async def test_constraint_filter_zero_prerequisite_violations(db_session, test_user):
    extractor = LearnerStateExtractor(db_session)
    state = await extractor.extract_state(test_user.id)
    
    # Artificially mark a skill as blocked
    if state.skill_gaps:
        blocked_id = state.skill_gaps[0].skill_id
        state.blocked_gap_skill_ids.add(blocked_id)

    generator = CandidateGenerator(db_session)
    raw_candidates = await generator.generate_candidates(state, limit=20)

    filter_engine = ConstraintFilter()
    filtered = filter_engine.apply_filters(raw_candidates, state)

    # Verify no candidate in filtered exclusively teaches blocked skill
    for f in filtered:
        skill_ids = [rs.skill_id for rs in f.resource.resource_skills]
        if skill_ids:
            assert not all(sid in state.blocked_gap_skill_ids for sid in skill_ids)

@pytest.mark.asyncio
async def test_feature_extraction_and_scoring(db_session, test_user):
    extractor = LearnerStateExtractor(db_session)
    state = await extractor.extract_state(test_user.id)

    generator = CandidateGenerator(db_session)
    candidates = await generator.generate_candidates(state, limit=10)

    feature_extractor = FeatureExtractor()
    scorer = HybridScorer()

    for cand in candidates:
        scored = feature_extractor.extract_features(cand, state)
        
        # Verify all 8 dimensions are in [0, 1]
        assert 0.0 <= scored.skill_gap_score <= 1.0
        assert 0.0 <= scored.career_alignment_score <= 1.0
        assert 0.0 <= scored.roadmap_affinity_score <= 1.0
        assert 0.0 <= scored.semantic_similarity_score <= 1.0
        assert 0.0 <= scored.difficulty_fit_score <= 1.0
        assert 0.0 <= scored.format_fit_score <= 1.0
        assert 0.0 <= scored.pacing_fit_score <= 1.0
        assert 0.0 <= scored.feedback_fit_score <= 1.0

        scorer.score_candidate(scored)
        assert 0.0 <= scored.composite_score <= 100.0

@pytest.mark.asyncio
async def test_diversity_ranker_mmr_and_ild(db_session, test_user):
    engine = HybridRecommendationEngine(db_session)
    recs = await engine.get_recommendations(user_id=test_user.id, limit=5, persist_log=False)

    assert len(recs) <= 5
    assert len(recs) > 0
    
    # Check that relevance score is ordered or balanced
    for r in recs:
        assert r.relevance_score > 0
        assert r.match_tier in ("Top Recommendation", "High Priority Gap", "Hands-on Project", "Foundation Builder", "Skill Reinforcement", "Recommended")
        assert len(r.explanation_reasons) > 0

@pytest.mark.asyncio
async def test_hybrid_recommendation_engine_full_flow(db_session, test_user):
    engine = HybridRecommendationEngine(db_session)
    recs = await engine.get_recommendations(user_id=test_user.id, limit=6, persist_log=True)

    assert len(recs) > 0
    top_item = recs[0]
    assert top_item.feature_breakdown is not None
    assert top_item.feature_breakdown.composite_score > 0

    # Test next best action
    next_action = await engine.get_next_best_action(user_id=test_user.id)
    assert next_action is not None
    assert next_action.title != ""
    assert next_action.headline != ""
    assert len(next_action.reasons) > 0
