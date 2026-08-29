from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger("pathpilot.adaptive.readiness")

DIFFICULTY_NUMERICAL = {
    "Beginner": 0.25,
    "Intermediate": 0.60,
    "Advanced": 0.90,
}

class ReadinessScorer:
    """
    Computes learner cognitive readiness for skills/resources and categorizes difficulty fit.
    """

    @staticmethod
    def calculate_skill_readiness(
        skill_proficiency: float,
        prerequisite_proficiencies: List[float],
        confidence: float
    ) -> float:
        """
        Calculates readiness score in [0.0, 1.0].
        Heavily weighted by satisfaction of prerequisite foundation.
        """
        if not prerequisite_proficiencies:
            prereq_score = 1.0
        else:
            # Geometric / minimum penalty on prerequisites
            prereq_score = sum(prerequisite_proficiencies) / len(prerequisite_proficiencies)
            min_prereq = min(prerequisite_proficiencies)
            if min_prereq < 0.60:
                prereq_score = prereq_score * 0.70

        readiness = (0.60 * prereq_score) + (0.30 * skill_proficiency) + (0.10 * confidence)
        return max(0.0, min(1.0, round(readiness, 4)))

    @classmethod
    def evaluate_resource_fit(
        cls,
        learner_readiness: float,
        resource_difficulty: str
    ) -> Dict[str, Any]:
        """
        Categorizes difficulty fit into: TOO_EASY, APPROPRIATE, CHALLENGING, TOO_HARD.
        """
        target_diff = DIFFICULTY_NUMERICAL.get(resource_difficulty, 0.50)
        diff_delta = target_diff - learner_readiness

        if diff_delta > 0.35:
            fit_category = "TOO_HARD"
            fit_score = 0.30
            reason = f"Resource is too advanced ({resource_difficulty}) given current readiness ({learner_readiness*100:.0f}%)."
        elif diff_delta > 0.15:
            fit_category = "CHALLENGING"
            fit_score = 0.85
            reason = f"Resource provides a healthy learning stretch ({resource_difficulty})."
        elif diff_delta < -0.35:
            fit_category = "TOO_EASY"
            fit_score = 0.40
            reason = f"Resource is too basic ({resource_difficulty}) for current proficiency."
        else:
            fit_category = "APPROPRIATE"
            fit_score = 1.00
            reason = f"Resource difficulty ({resource_difficulty}) perfectly matches readiness."

        return {
            "fit_category": fit_category,
            "fit_score": fit_score,
            "learner_readiness": learner_readiness,
            "resource_difficulty": resource_difficulty,
            "reason": reason
        }
