from typing import List, Dict, Any
from datetime import datetime, timezone
import logging

from app.models.learning_path import LearningPathItem
from app.models.progress import Progress
from app.services.adaptive.config import (
    PACE_FAST_VELOCITY,
    PACE_SLOW_VELOCITY,
)

logger = logging.getLogger("pathpilot.adaptive.pace")

class PaceEstimator:
    """
    Estimates empirical learning pace based on completion rates, duration ratios, and study consistency.
    """

    @staticmethod
    def estimate_pace(
        completed_items: List[LearningPathItem],
        study_logs: List[Progress],
        days_active: int = 7
    ) -> Dict[str, Any]:
        """
        Estimates learner pace: FAST, NORMAL, SLOW, UNKNOWN.
        """
        if not completed_items and not study_logs:
            return {
                "pace": "UNKNOWN",
                "velocity_ratio": 1.0,
                "completed_count": 0,
                "total_study_minutes": 0,
                "confidence": 0.20,
                "description": "Insufficient completion data to estimate learning pace."
            }

        completed_count = len(completed_items)
        total_study_minutes = sum(
            getattr(log, "time_spent_minutes", getattr(log, "duration_minutes", 0))
            for log in study_logs
        ) if study_logs else 0

        # Require at least 2 completed milestones or >= 120 minutes of study logs

        if completed_count < 2 and total_study_minutes < 120:
            return {
                "pace": "NORMAL",
                "velocity_ratio": 1.0,
                "completed_count": completed_count,
                "total_study_minutes": total_study_minutes,
                "confidence": 0.45,
                "description": "Baseline pace assumed during early learning activity."
            }

        # Calculate estimated hours vs actual study hours
        estimated_hours = sum(item.estimated_hours for item in completed_items) if completed_items else 2.0
        actual_hours = max(0.5, total_study_minutes / 60.0)

        # Velocity ratio: estimated / actual (Higher ratio means faster completion)
        velocity_ratio = round(estimated_hours / actual_hours, 2)

        if velocity_ratio >= PACE_FAST_VELOCITY or (completed_count >= 4 and days_active <= 7):
            pace = "FAST"
            desc = "Learner is progressing faster than standard curriculum benchmarks."
            confidence = 0.85
        elif velocity_ratio <= PACE_SLOW_VELOCITY or (completed_count <= 1 and days_active >= 21):
            pace = "SLOW"
            desc = "Learner is progressing deliberately; reinforced pacing recommended."
            confidence = 0.80
        else:
            pace = "NORMAL"
            desc = "Learner is progressing according to standard course pacing."
            confidence = 0.90

        return {
            "pace": pace,
            "velocity_ratio": velocity_ratio,
            "completed_count": completed_count,
            "total_study_minutes": total_study_minutes,
            "confidence": confidence,
            "description": desc
        }
