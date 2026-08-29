import logging
from typing import Dict, List
from app.services.recommendation.types import ScoredCandidate

logger = logging.getLogger("pathpilot.recommendation.hybrid_scorer")

DEFAULT_WEIGHTS = {
    "skill_gap": 0.22,
    "career_alignment": 0.18,
    "roadmap_affinity": 0.18,
    "semantic_similarity": 0.15,
    "difficulty_fit": 0.10,
    "format_preference": 0.07,
    "pacing_fit": 0.05,
    "feedback_prior": 0.05,
}

class HybridScorer:
    """
    Computes calibrated composite scoring across all 8 normalized feature dimensions.
    """

    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or DEFAULT_WEIGHTS
        # Normalize weights to ensure sum = 1.0
        total_w = sum(self.weights.values())
        if total_w > 0:
            self.weights = {k: v / total_w for k, v in self.weights.items()}

    def score_candidate(self, candidate: ScoredCandidate) -> ScoredCandidate:
        w = self.weights
        weighted_sum = (
            candidate.skill_gap_score * w.get("skill_gap", 0.22)
            + candidate.career_alignment_score * w.get("career_alignment", 0.18)
            + candidate.roadmap_affinity_score * w.get("roadmap_affinity", 0.18)
            + candidate.semantic_similarity_score * w.get("semantic_similarity", 0.15)
            + candidate.difficulty_fit_score * w.get("difficulty_fit", 0.10)
            + candidate.format_fit_score * w.get("format_preference", 0.07)
            + candidate.pacing_fit_score * w.get("pacing_fit", 0.05)
            + candidate.feedback_fit_score * w.get("feedback_prior", 0.05)
        )

        # Scale to 0-100 score range
        composite = round(weighted_sum * 100, 1)
        candidate.composite_score = composite
        return candidate

    def score_all(self, candidates: List[ScoredCandidate]) -> List[ScoredCandidate]:
        for c in candidates:
            self.score_candidate(c)
        candidates.sort(key=lambda x: x.composite_score, reverse=True)
        return candidates
