import logging
import math
from typing import Dict, List, Set, Optional
from app.services.recommendation.types import LearnerState, CandidateResource, ScoredCandidate

logger = logging.getLogger("pathpilot.recommendation.feature_extractor")

class FeatureExtractor:
    """
    Extracts an 8-dimensional normalized feature vector [0.0, 1.0] for each candidate resource.
    """

    def extract_features(self, candidate: CandidateResource, learner: LearnerState) -> ScoredCandidate:
        r = candidate.resource
        resource_skill_ids = [rs.skill_id for rs in r.resource_skills]

        # 1. Skill Gap Score [0.0 - 1.0] (Graph-Aware Intelligent Priority)
        gap_by_id = {g.skill_id: g for g in learner.skill_gaps}
        skill_gap_score = 0.1
        for sid in resource_skill_ids:
            gap_info = gap_by_id.get(sid)
            if gap_info:
                p_score = gap_info.intelligent_priority_score if gap_info.intelligent_priority_score > 0 else gap_info.priority_score
                if sid in learner.bottleneck_skill_ids:
                    p_score = min(1.0, p_score + 0.15)
                skill_gap_score = max(skill_gap_score, p_score)
            else:
                score = learner.learner_skills_map.get(sid, 0.0)
                gap_ratio = max(0.0, (85.0 - score) / 85.0)
                if sid in learner.unlocked_gap_skill_ids:
                    gap_ratio = min(1.0, gap_ratio * 1.1)
                skill_gap_score = max(skill_gap_score, gap_ratio)


        # 2. Career Alignment Score [0.0 - 1.0]
        career_alignment_score = 0.2
        target_career = learner.target_career
        if target_career and target_career.career_skills:
            for cs in target_career.career_skills:
                if cs.skill_id in resource_skill_ids:
                    # Weight normalized
                    w = float(cs.weight or 0.2)
                    career_alignment_score = max(career_alignment_score, min(1.0, w * 3.5 + 0.3))
        elif resource_skill_ids:
            career_alignment_score = 0.6

        # 3. Roadmap Affinity Score [0.0 - 1.0]
        roadmap_affinity_score = 0.1
        if learner.active_milestone_skill_id and learner.active_milestone_skill_id in resource_skill_ids:
            roadmap_affinity_score = 1.0 # Active milestone exact match
        elif learner.roadmap_skill_order:
            # Check if it appears in next 2 roadmap steps
            active_idx = -1
            if learner.active_milestone_skill_id in learner.roadmap_skill_order:
                active_idx = learner.roadmap_skill_order.index(learner.active_milestone_skill_id)
            
            for sid in resource_skill_ids:
                if sid in learner.roadmap_skill_order:
                    idx = learner.roadmap_skill_order.index(sid)
                    if active_idx != -1 and idx == active_idx + 1:
                        roadmap_affinity_score = max(roadmap_affinity_score, 0.7) # Next immediate step
                    elif active_idx != -1 and idx > active_idx:
                        roadmap_affinity_score = max(roadmap_affinity_score, 0.4) # Future step
                    else:
                        roadmap_affinity_score = max(roadmap_affinity_score, 0.3)

        # 4. Semantic Similarity Score [0.0 - 1.0]
        semantic_similarity_score = max(0.1, min(1.0, float(candidate.semantic_similarity)))

        # 5. Difficulty Fit Score [0.0 - 1.0]
        difficulty_fit_score = self._compute_difficulty_fit(r.difficulty, learner)

        # 6. Format Preference Score [0.0 - 1.0]
        format_fit_score = self._compute_format_fit(r.resource_type, r.is_interactive, learner)

        # 7. Pacing Fit Score [0.0 - 1.0]
        pacing_fit_score = self._compute_pacing_fit(r.estimated_minutes, learner.learning_pace)

        # 8. Feedback Prior Score [0.0 - 1.0]
        feedback_fit_score = self._compute_feedback_prior(r.resource_type, r.difficulty, learner)

        return ScoredCandidate(
            candidate=candidate,
            skill_gap_score=round(min(1.0, max(0.0, skill_gap_score)), 4),
            career_alignment_score=round(min(1.0, max(0.0, career_alignment_score)), 4),
            roadmap_affinity_score=round(min(1.0, max(0.0, roadmap_affinity_score)), 4),
            semantic_similarity_score=round(min(1.0, max(0.0, semantic_similarity_score)), 4),
            difficulty_fit_score=round(min(1.0, max(0.0, difficulty_fit_score)), 4),
            format_fit_score=round(min(1.0, max(0.0, format_fit_score)), 4),
            pacing_fit_score=round(min(1.0, max(0.0, pacing_fit_score)), 4),
            feedback_fit_score=round(min(1.0, max(0.0, feedback_fit_score)), 4),
        )

    def _compute_difficulty_fit(self, resource_difficulty: str, learner: LearnerState) -> float:
        exp = learner.experience_level.lower()
        diff = resource_difficulty.lower()

        matrix = {
            "beginner": {"beginner": 1.0, "intermediate": 0.6, "advanced": 0.2},
            "intermediate": {"beginner": 0.6, "intermediate": 1.0, "advanced": 0.7},
            "advanced": {"beginner": 0.3, "intermediate": 0.8, "advanced": 1.0},
        }

        user_diffs = matrix.get(exp, matrix["beginner"])
        return user_diffs.get(diff, 0.7)

    def _compute_format_fit(self, r_type: str, is_interactive: bool, learner: LearnerState) -> float:
        pref = learner.preferred_format.lower()
        rt = r_type.lower()

        if rt in learner.disliked_formats:
            return 0.2
        if rt in learner.liked_formats:
            return 0.95

        if pref == "interactive" and (is_interactive or rt in ("practice", "project")):
            return 1.0
        if pref == "projects" and rt == "project":
            return 1.0
        if pref == "video" and rt in ("video", "course"):
            return 0.9
        if pref == "reading" and rt in ("article", "course", "documentation"):
            return 0.9

        return 0.65

    def _compute_pacing_fit(self, estimated_minutes: int, learning_pace: str) -> float:
        # Session duration budget per pace
        target_minutes = 45
        if learning_pace == "casual":
            target_minutes = 20
        elif learning_pace == "intensive":
            target_minutes = 90

        diff = abs(estimated_minutes - target_minutes)
        # Smooth exponential decay penalty
        fit = math.exp(- (diff ** 2) / (2 * (60 ** 2)))
        return max(0.2, min(1.0, fit))

    def _compute_feedback_prior(self, r_type: str, difficulty: str, learner: LearnerState) -> float:
        score = 0.5
        for fb in learner.feedback_history:
            fb_type = fb.get("type", "")
            if fb_type == "too_hard" and difficulty.lower() == "advanced":
                score -= 0.15
            elif fb_type == "too_easy" and difficulty.lower() == "beginner":
                score -= 0.15
            elif fb_type == "useful":
                score += 0.1
        return max(0.1, min(0.9, score))
