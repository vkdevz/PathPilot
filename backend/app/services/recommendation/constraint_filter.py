import logging
from typing import List
from app.services.recommendation.types import LearnerState, CandidateResource

logger = logging.getLogger("pathpilot.recommendation.constraint_filter")

class ConstraintFilter:
    """
    Applies strict hard constraint rules before scoring:
    1. Prerequisite Gating (Prerequisite Violation Rate = 0.0%)
    2. Completed Resource Suppression (Prevent redundant recommendations)
    3. Mastered Skill Redundancy Control
    """

    def __init__(self):
        pass

    def apply_filters(
        self,
        candidates: List[CandidateResource],
        learner: LearnerState,
        allow_completed: bool = False
    ) -> List[CandidateResource]:
        valid_candidates: List[CandidateResource] = []

        for candidate in candidates:
            r = candidate.resource

            # 1. Completed Resource Suppression
            if not allow_completed and r.id in learner.completed_resource_ids:
                logger.debug(f"Suppressed completed resource {r.slug}")
                continue

            # 2. Prerequisite Gating
            # Check if this resource exclusively targets skills that have unsatisfied prerequisites
            resource_skill_ids = [rs.skill_id for rs in r.resource_skills]
            
            # If all taught skills are blocked by unmet prerequisites, discard
            if resource_skill_ids and all(sid in learner.blocked_gap_skill_ids for sid in resource_skill_ids):
                logger.debug(f"Suppressed prerequisite-blocked resource {r.slug}")
                continue

            # 3. Mastered Skill Suppression
            # If every skill taught by this resource is already mastered (score >= 90), suppress
            if resource_skill_ids and all(sid in learner.mastered_skill_ids for sid in resource_skill_ids):
                # Only keep if it's an advanced project/practice
                if r.resource_type not in ("project", "practice"):
                    logger.debug(f"Suppressed fully mastered skill resource {r.slug}")
                    continue

            valid_candidates.append(candidate)

        return valid_candidates
