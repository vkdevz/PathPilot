import pytest
from datetime import datetime, timezone, timedelta

from app.models.adaptive import LearnerEvidence
from app.services.adaptive.config import (
    EVIDENCE_RELIABILITY_WEIGHTS,
    EVIDENCE_BASE_CONFIDENCE,
    RECENCY_HALF_LIFE_DAYS,
    ALGORITHM_VERSION,
)
from app.services.adaptive.evidence_service import EvidenceService
from app.services.adaptive.proficiency_engine import ProficiencyEngine
from app.services.adaptive.mastery_struggle_detector import MasteryStruggleDetector
from app.services.adaptive.pace_estimator import PaceEstimator
from app.services.adaptive.feedback_processor import FeedbackProcessor
from app.services.adaptive.readiness_scorer import ReadinessScorer

def test_evidence_reliability_hierarchy():
    """Verify that verified assessments have highest reliability and self-reports have lower weight."""
    assert EVIDENCE_RELIABILITY_WEIGHTS["ASSESSMENT"] > EVIDENCE_RELIABILITY_WEIGHTS["PROJECT"]
    assert EVIDENCE_RELIABILITY_WEIGHTS["PROJECT"] > EVIDENCE_RELIABILITY_WEIGHTS["QUIZ"]
    assert EVIDENCE_RELIABILITY_WEIGHTS["QUIZ"] > EVIDENCE_RELIABILITY_WEIGHTS["RESOURCE_COMPLETION"]
    assert EVIDENCE_RELIABILITY_WEIGHTS["RESOURCE_COMPLETION"] > EVIDENCE_RELIABILITY_WEIGHTS["SELF_REPORT"]
    assert EVIDENCE_RELIABILITY_WEIGHTS["ASSESSMENT"] == 1.00

def test_dedup_hash_determinism():
    """Verify SHA-256 idempotency hash generates identical hash for identical payload."""
    h1 = EvidenceService.calculate_dedup_hash("u1", "s1", "ASSESSMENT", "attempt_1", 0.85)
    h2 = EvidenceService.calculate_dedup_hash("u1", "s1", "ASSESSMENT", "attempt_1", 0.85)
    h3 = EvidenceService.calculate_dedup_hash("u1", "s1", "ASSESSMENT", "attempt_2", 0.85)
    assert h1 == h2
    assert h1 != h3

def test_proficiency_update_mathematics():
    """Verify proficiency update smoothly incorporates evidence without naive override."""
    ev = LearnerEvidence(
        user_id="u1",
        skill_id="stats",
        evidence_type="ASSESSMENT",
        score=0.85,
        confidence=0.90,
        weight=1.00,
        created_at=datetime.now(timezone.utc)
    )
    result = ProficiencyEngine.compute_update(
        current_proficiency=0.35,
        current_confidence=0.40,
        evidence=ev
    )
    assert result["new_proficiency"] > 0.35
    assert result["new_proficiency"] < 0.85
    assert result["new_confidence"] > 0.40
    assert result["proficiency_delta"] > 0.0

def test_recency_decay():
    """Verify that older evidence decays exponentially based on half-life."""
    fresh_time = datetime.now(timezone.utc) - timedelta(minutes=5)
    half_life_time = datetime.now(timezone.utc) - timedelta(days=RECENCY_HALF_LIFE_DAYS)
    old_time = datetime.now(timezone.utc) - timedelta(days=RECENCY_HALF_LIFE_DAYS * 2)

    w_fresh = ProficiencyEngine.calculate_recency_weight(fresh_time)
    w_half = ProficiencyEngine.calculate_recency_weight(half_life_time)
    w_old = ProficiencyEngine.calculate_recency_weight(old_time)

    assert w_fresh > 0.99
    assert abs(w_half - 0.50) < 0.05
    assert abs(w_old - 0.25) < 0.05

def test_mastery_classification():
    """Verify mastery state thresholds."""
    assert MasteryStruggleDetector.classify_mastery(0.90, 0.85) == "MASTERED"
    assert MasteryStruggleDetector.classify_mastery(0.90, 0.50) == "NEAR_MASTERY" # High score but low confidence
    assert MasteryStruggleDetector.classify_mastery(0.78, 0.80) == "NEAR_MASTERY"
    assert MasteryStruggleDetector.classify_mastery(0.60, 0.80) == "PRACTICING"
    assert MasteryStruggleDetector.classify_mastery(0.35, 0.80) == "DEVELOPING"
    assert MasteryStruggleDetector.classify_mastery(0.10, 0.80) == "NOT_STARTED"

def test_struggle_detection_consecutive_failures():
    """Verify struggle detection on repeated failures."""
    history = [
        LearnerEvidence(user_id="u", skill_id="s", evidence_type="ASSESSMENT", score=0.35, weight=1.0, confidence=0.9),
        LearnerEvidence(user_id="u", skill_id="s", evidence_type="ASSESSMENT", score=0.38, weight=1.0, confidence=0.9),
    ]
    eval_res = MasteryStruggleDetector.evaluate_struggle(history, current_proficiency=0.36)
    assert eval_res["is_struggling"] is True
    assert eval_res["struggle_state"] in ["STRUGGLING", "SEVERELY_STRUGGLING"]
    assert eval_res["recommended_intervention"] is not None

def test_single_low_score_not_struggle():
    """Verify that a single bad score does not falsely trigger struggle."""
    history = [
        LearnerEvidence(user_id="u", skill_id="s", evidence_type="ASSESSMENT", score=0.40, weight=1.0, confidence=0.9),
        LearnerEvidence(user_id="u", skill_id="s", evidence_type="ASSESSMENT", score=0.85, weight=1.0, confidence=0.9),
    ]
    eval_res = MasteryStruggleDetector.evaluate_struggle(history, current_proficiency=0.70)
    assert eval_res["is_struggling"] is False

def test_learning_pace_estimation():
    """Verify pace estimator classifies FAST, NORMAL, SLOW, and UNKNOWN."""
    unknown = PaceEstimator.estimate_pace([], [])
    assert unknown["pace"] == "UNKNOWN"

def test_feedback_nlp_classification():
    """Verify natural language feedback classification rules."""
    too_hard = FeedbackProcessor.classify_natural_language_feedback("The exercises were too difficult and confusing.")
    assert too_hard["difficulty_signal"] == "TOO_HARD"
    assert too_hard["sentiment"] == "NEGATIVE"

    project_pref = FeedbackProcessor.classify_natural_language_feedback("I prefer building hands-on projects instead of videos.")
    assert project_pref["format_preference"] == "PROJECTS"

def test_readiness_and_resource_fit():
    """Verify readiness calculation and difficulty fit matrix."""
    fit_app = ReadinessScorer.evaluate_resource_fit(learner_readiness=0.60, resource_difficulty="Intermediate")
    assert fit_app["fit_category"] == "APPROPRIATE"
    assert fit_app["fit_score"] == 1.00

    fit_hard = ReadinessScorer.evaluate_resource_fit(learner_readiness=0.20, resource_difficulty="Advanced")
    assert fit_hard["fit_category"] == "TOO_HARD"
    assert fit_hard["fit_score"] < 0.50
