from typing import List, Dict, Any, Optional
import logging

from app.models.adaptive import LearnerEvidence
from app.services.adaptive.config import (
    MASTERY_PROMOTED_THRESHOLD,
    MASTERY_MIN_CONFIDENCE,
    NEAR_MASTERY_THRESHOLD,
    PRACTICING_THRESHOLD,
    DEVELOPING_THRESHOLD,
    STRUGGLE_CONSECUTIVE_FAILURES,
    STRUGGLE_SCORE_THRESHOLD,
    STRUGGLE_RETRY_COUNT,
)

logger = logging.getLogger("pathpilot.adaptive.detector")

class MasteryStruggleDetector:
    """
    Detects skill mastery and persistent learner struggle using multi-session evidence.
    """

    @staticmethod
    def classify_mastery(proficiency: float, confidence: float) -> str:
        """
        Classifies skill mastery state based on proficiency and epistemic confidence.
        """
        if proficiency >= MASTERY_PROMOTED_THRESHOLD and confidence >= MASTERY_MIN_CONFIDENCE:
            return "MASTERED"
        elif proficiency >= NEAR_MASTERY_THRESHOLD:
            return "NEAR_MASTERY"
        elif proficiency >= PRACTICING_THRESHOLD:
            return "PRACTICING"
        elif proficiency >= DEVELOPING_THRESHOLD:
            return "DEVELOPING"
        else:
            return "NOT_STARTED"

    @classmethod
    def evaluate_struggle(
        cls,
        evidence_history: List[LearnerEvidence],
        current_proficiency: float
    ) -> Dict[str, Any]:
        """
        Evaluates chronological evidence history to detect struggle and suggest pedagogical interventions.
        """
        if not evidence_history:
            return {
                "struggle_state": "NORMAL",
                "is_struggling": False,
                "consecutive_failures": 0,
                "recommended_intervention": None,
                "reason": "No evidence history available."
            }

        # Focus on evaluative evidence (ASSESSMENT, QUIZ, PROJECT)
        evaluative = [
            e for e in evidence_history 
            if e.evidence_type in ["ASSESSMENT", "QUIZ", "PROJECT"]
        ]

        if not evaluative:
            return {
                "struggle_state": "NORMAL",
                "is_struggling": False,
                "consecutive_failures": 0,
                "recommended_intervention": None,
                "reason": "No evaluative assessment evidence yet."
            }

        # Check consecutive recent failures (chronologically newest first)
        consecutive_failures = 0
        for e in evaluative:
            if e.score < STRUGGLE_SCORE_THRESHOLD:
                consecutive_failures += 1
            else:
                break

        total_attempts = len(evaluative)
        avg_score = sum(e.score for e in evaluative) / total_attempts

        # Classify struggle state
        if consecutive_failures >= 3 or (total_attempts >= 3 and avg_score < 0.40):
            struggle_state = "SEVERELY_STRUGGLING"
            is_struggling = True
            intervention = "prerequisite_review"
            reason = f"Severe struggle detected: {consecutive_failures} consecutive scores below 45% (avg: {avg_score*100:.1f}%)."
        elif consecutive_failures >= STRUGGLE_CONSECUTIVE_FAILURES or (total_attempts >= 2 and avg_score < 0.45):
            struggle_state = "STRUGGLING"
            is_struggling = True
            intervention = "easier_resource"
            reason = f"Struggle detected: {consecutive_failures} consecutive low scores. Recommending foundational reinforcement."
        elif consecutive_failures == 1 and current_proficiency < 0.50:
            struggle_state = "AT_RISK"
            is_struggling = False
            intervention = "additional_practice"
            reason = "Recent assessment score below threshold; learner is at risk."
        else:
            struggle_state = "NORMAL"
            is_struggling = False
            intervention = None
            reason = "Learner performance is progressing normally."

        return {
            "struggle_state": struggle_state,
            "is_struggling": is_struggling,
            "consecutive_failures": consecutive_failures,
            "total_attempts": total_attempts,
            "average_score": round(avg_score, 4),
            "recommended_intervention": intervention,
            "reason": reason
        }
