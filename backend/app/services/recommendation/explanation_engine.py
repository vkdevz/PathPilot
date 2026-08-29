import logging
from typing import List
from app.services.recommendation.types import LearnerState, ScoredCandidate

logger = logging.getLogger("pathpilot.recommendation.explanation_engine")

class ExplanationEngine:
    """
    Generates transparent, pedagogical explainable AI (XAI) justifications for each recommendation.
    """

    def generate_explanation(self, candidate: ScoredCandidate, learner: LearnerState, rank_position: int = 1) -> ScoredCandidate:
        r = candidate.candidate.resource
        reasons: List[str] = []
        target_skill_name = None
        current_skill_score = 0.0

        if candidate.candidate.primary_target_skill:
            target_skill = candidate.candidate.primary_target_skill
            target_skill_name = target_skill.name
            current_skill_score = learner.learner_skills_map.get(target_skill.id, 0.0)

        # 1. Milestone alignment reason
        if candidate.roadmap_affinity_score >= 0.8:
            step_str = f"Milestone #{learner.active_milestone_step}" if learner.active_milestone_step else "Active Milestone"
            reasons.append(f"Directly advances your {step_str} ({target_skill_name or 'Current Topic'})")
        elif candidate.roadmap_affinity_score >= 0.6:
            reasons.append(f"Prepares next upcoming roadmap milestone ({target_skill_name or 'Next Topic'})")

        # 2. Skill gap reason
        if candidate.skill_gap_score >= 0.5 and target_skill_name:
            reasons.append(
                f"Targets assessed skill gap in {target_skill_name} (Current: {int(current_skill_score)}% → 85% Target)"
            )
        elif target_skill_name:
            reasons.append(f"Builds verified competency in {target_skill_name}")

        # 3. Target Career Alignment
        if candidate.career_alignment_score >= 0.6 and learner.target_career_name:
            reasons.append(f"Core industry requirement for {learner.target_career_name}")

        # 4. Learning format fit
        if r.is_interactive:
            reasons.append("Hands-on interactive lab suited for active retention and practice")
        elif r.resource_type == "project":
            reasons.append("Applied portfolio project demonstrating end-to-end practical mastery")
        else:
            reasons.append(f"Curated {r.difficulty.lower()} learning module from {r.provider}")

        # 5. Pacing & Time budget
        if candidate.pacing_fit_score >= 0.7:
            reasons.append(f"Paced for ~{r.estimated_minutes}m focused study session ({learner.learning_pace} pace)")

        # Determine Match Tier
        if rank_position == 1 or candidate.composite_score >= 88:
            match_tier = "Top Recommendation"
        elif candidate.skill_gap_score >= 0.7:
            match_tier = "High Priority Gap"
        elif r.resource_type == "project":
            match_tier = "Hands-on Project"
        elif r.difficulty == "Beginner" and candidate.difficulty_fit_score >= 0.8:
            match_tier = "Foundation Builder"
        elif candidate.composite_score >= 70:
            match_tier = "Skill Reinforcement"
        else:
            match_tier = "Recommended"

        candidate.match_tier = match_tier
        candidate.explanation_reasons = reasons[:4]
        return candidate
