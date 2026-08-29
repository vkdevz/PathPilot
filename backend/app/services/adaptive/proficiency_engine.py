import math
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from app.models.adaptive import LearnerEvidence
from app.services.adaptive.config import (
    MAX_PROFICIENCY_ALPHA,
    MIN_PROFICIENCY_ALPHA,
    RECENCY_HALF_LIFE_DAYS,
)

logger = logging.getLogger("pathpilot.adaptive.proficiency")

class ProficiencyEngine:
    """
    Deterministic proficiency and confidence update engine.
    Calculates Bayesian-inspired state updates with exponential recency decay.
    """

    @staticmethod
    def calculate_recency_weight(evidence_timestamp: Optional[datetime]) -> float:
        """
        Computes exponential decay factor: 2^(-delta_t / half_life).
        """
        if not evidence_timestamp:
            return 1.0
        
        now = datetime.now(timezone.utc)
        if evidence_timestamp.tzinfo is None:
            evidence_timestamp = evidence_timestamp.replace(tzinfo=timezone.utc)
            
        delta_days = max(0.0, (now - evidence_timestamp).total_seconds() / 86400.0)
        decay = math.pow(0.5, delta_days / RECENCY_HALF_LIFE_DAYS)
        return max(0.10, min(1.0, decay))

    @classmethod
    def compute_update(
        cls,
        current_proficiency: float,
        current_confidence: float,
        evidence: LearnerEvidence
    ) -> Dict[str, Any]:
        """
        Computes the updated proficiency, confidence, and mathematical telemetry.
        """
        recency = cls.calculate_recency_weight(evidence.created_at)
        
        # 1. Calculate learning step rate alpha
        raw_alpha = evidence.weight * evidence.confidence * recency
        alpha = max(MIN_PROFICIENCY_ALPHA, min(MAX_PROFICIENCY_ALPHA, raw_alpha))

        # 2. Update proficiency
        new_proficiency = (current_proficiency * (1.0 - alpha)) + (evidence.score * alpha)
        new_proficiency = max(0.0, min(1.0, round(new_proficiency, 4)))

        # 3. Update epistemic confidence
        # Consistent evidence increases confidence
        confidence_gain = (1.0 - current_confidence) * (evidence.weight * evidence.confidence * 0.40)
        new_confidence = current_confidence + confidence_gain

        # Penalize confidence slightly if new evidence severely conflicts with old belief
        discrepancy = abs(evidence.score - current_proficiency)
        if discrepancy > 0.40 and current_confidence > 0.50:
            conflict_penalty = 0.15 * discrepancy
            new_confidence = max(0.35, new_confidence - conflict_penalty)

        new_confidence = max(0.10, min(0.99, round(new_confidence, 4)))

        return {
            "previous_proficiency": current_proficiency,
            "new_proficiency": new_proficiency,
            "proficiency_delta": round(new_proficiency - current_proficiency, 4),
            "previous_confidence": current_confidence,
            "new_confidence": new_confidence,
            "alpha": round(alpha, 4),
            "evidence_reliability": evidence.weight,
            "evidence_score": evidence.score,
            "recency_factor": round(recency, 4),
            "discrepancy": round(discrepancy, 4)
        }
