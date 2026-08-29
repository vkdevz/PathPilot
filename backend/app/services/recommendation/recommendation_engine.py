import logging
import time
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.recommendation import RecommendationLog
from app.repositories.recommendation_repository import RecommendationRepository
from app.schemas.recommendation import (
    PersonalizedRecommendationItem,
    NextBestActionResponse,
    FeatureScoreBreakdown
)
from app.services.recommendation.learner_state_extractor import LearnerStateExtractor
from app.services.recommendation.candidate_generator import CandidateGenerator
from app.services.recommendation.constraint_filter import ConstraintFilter
from app.services.recommendation.feature_extractor import FeatureExtractor
from app.services.recommendation.hybrid_scorer import HybridScorer, DEFAULT_WEIGHTS
from app.services.recommendation.diversity_ranker import DiversityRanker
from app.services.recommendation.explanation_engine import ExplanationEngine
from app.services.recommendation.types import LearnerState, ScoredCandidate

logger = logging.getLogger("pathpilot.recommendation.engine")

class HybridRecommendationEngine:
    """
    Production Hybrid AI Recommendation Engine for PathPilot 2.0.
    Integrates Learner Model + Career Requirements + Assessed Skill Gaps + DAG Prerequisites
    + pgvector Semantic Retrieval + Difficulty/Format/Pacing Fit + MMR Diversification + XAI Explanations.
    """

    def __init__(self, session: AsyncSession, custom_weights: Optional[Dict[str, float]] = None):
        self.session = session
        self.state_extractor = LearnerStateExtractor(session)
        self.candidate_generator = CandidateGenerator(session)
        self.constraint_filter = ConstraintFilter()
        self.feature_extractor = FeatureExtractor()
        self.scorer = HybridScorer(weights=custom_weights)
        self.ranker = DiversityRanker(lambda_param=0.75)
        self.explainer = ExplanationEngine()
        self.rec_repo = RecommendationRepository(session)

    async def get_recommendations(
        self,
        user_id: str,
        limit: int = 10,
        resource_type: Optional[str] = None,
        difficulty: Optional[str] = None,
        persist_log: bool = True
    ) -> List[PersonalizedRecommendationItem]:
        start_time = time.time()

        # 1. State Extraction
        learner = await self.state_extractor.extract_state(user_id)

        # 2. Candidate Generation
        raw_candidates = await self.candidate_generator.generate_candidates(learner, limit=35)
        total_gen = len(raw_candidates)

        # 3. Hard Constraint Filtering (Prerequisites & Completed items)
        filtered_candidates = self.constraint_filter.apply_filters(raw_candidates, learner)
        total_filtered = len(filtered_candidates)

        # Apply optional runtime query filters if requested
        if resource_type and resource_type.lower() != "all":
            filtered_candidates = [c for c in filtered_candidates if c.resource.resource_type.lower() == resource_type.lower()]
        if difficulty and difficulty.lower() != "all":
            filtered_candidates = [c for c in filtered_candidates if c.resource.difficulty.lower() == difficulty.lower()]

        # 4. Feature Extraction
        scored_candidates: List[ScoredCandidate] = [
            self.feature_extractor.extract_features(cand, learner)
            for cand in filtered_candidates
        ]

        # 5. Hybrid Scoring
        scored_candidates = self.scorer.score_all(scored_candidates)

        # 6. Diversity Re-ranking (MMR)
        top_candidates = self.ranker.rank_and_diversify(scored_candidates, top_k=limit)
        ild = self.ranker.calculate_intra_list_diversity(top_candidates)

        # 7. Explainable AI Annotations
        for rank_idx, cand in enumerate(top_candidates, start=1):
            self.explainer.generate_explanation(cand, learner, rank_position=rank_idx)

        duration_ms = round((time.time() - start_time) * 1000, 2)

        # 8. Telemetry & Log Persistence
        if persist_log and top_candidates:
            try:
                feature_scores_snapshot = {
                    cand.candidate.resource.id: {
                        "composite": cand.composite_score,
                        "skill_gap": cand.skill_gap_score,
                        "career_alignment": cand.career_alignment_score,
                        "roadmap_affinity": cand.roadmap_affinity_score,
                        "semantic_similarity": cand.semantic_similarity_score,
                        "difficulty_fit": cand.difficulty_fit_score,
                        "format_fit": cand.format_fit_score,
                        "pacing_fit": cand.pacing_fit_score,
                        "feedback_fit": cand.feedback_fit_score,
                    }
                    for cand in top_candidates
                }

                rec_log = RecommendationLog(
                    user_id=user_id,
                    target_career_id=learner.target_career.id if learner.target_career else None,
                    algorithm_version="hybrid-v2.0",
                    top_resource_id=top_candidates[0].candidate.resource.id,
                    recommended_resource_ids=[cand.candidate.resource.id for cand in top_candidates],
                    feature_scores=feature_scores_snapshot,
                    total_candidates_generated=total_gen,
                    candidates_after_filter=total_filtered,
                    intra_list_diversity=ild,
                    latency_ms=duration_ms,
                    context_snapshot={
                        "target_career": learner.target_career_name,
                        "active_milestone": learner.active_milestone_skill_name,
                        "experience_level": learner.experience_level,
                        "total_gaps": len(learner.skill_gaps)
                    }
                )
                await self.rec_repo.log_recommendation_run(rec_log)
                await self.session.commit()
            except Exception as e:
                logger.warning(f"Telemetry log persistence non-blocking note: {e}")

        # 9. Format response items
        results: List[PersonalizedRecommendationItem] = []
        for cand in top_candidates:
            r = cand.candidate.resource
            skills_taught = [rs.skill.name for rs in r.resource_skills if rs.skill]
            target_slug = cand.candidate.primary_target_skill.slug if cand.candidate.primary_target_skill else None
            target_name = cand.candidate.primary_target_skill.name if cand.candidate.primary_target_skill else None

            breakdown = FeatureScoreBreakdown(
                skill_gap=cand.skill_gap_score,
                career_alignment=cand.career_alignment_score,
                roadmap_affinity=cand.roadmap_affinity_score,
                semantic_similarity=cand.semantic_similarity_score,
                difficulty_fit=cand.difficulty_fit_score,
                format_preference=cand.format_fit_score,
                pacing_fit=cand.pacing_fit_score,
                feedback_prior=cand.feedback_fit_score,
                composite_score=cand.composite_score / 100.0
            )

            # Integer score for display
            display_score = int(round(cand.composite_score))

            results.append(PersonalizedRecommendationItem(
                id=f"rec-{r.id}",
                resource_id=r.id,
                slug=r.slug,
                title=r.title,
                description=r.description,
                resource_type=r.resource_type,
                url=r.url,
                difficulty=r.difficulty,
                estimated_minutes=r.estimated_minutes,
                provider=r.provider,
                is_interactive=r.is_interactive,
                skills_taught=skills_taught,
                target_skill_slug=target_slug,
                target_skill_name=target_name,
                relevance_score=display_score,
                match_tier=cand.match_tier,
                explanation_reasons=cand.explanation_reasons,
                feature_breakdown=breakdown
            ))

        return results

    async def get_next_best_action(self, user_id: str) -> Optional[NextBestActionResponse]:
        """
        Determines the authoritative single best next learning action for the learner's dashboard hero.
        """
        recommendations = await self.get_recommendations(user_id=user_id, limit=3, persist_log=False)
        if not recommendations:
            return None

        top = recommendations[0]
        learner = await self.state_extractor.extract_state(user_id)

        target_skill_score = 0.0
        if top.target_skill_slug:
            for sid, score in learner.learner_skills_map.items():
                if sid in learner.unlocked_gap_skill_ids or sid == learner.active_milestone_skill_id:
                    target_skill_score = score
                    break

        primary_reason = top.explanation_reasons[0] if top.explanation_reasons else "Optimally matches your skill profile"
        headline = f"Advance {top.target_skill_name or 'Core Skills'}"

        return NextBestActionResponse(
            resource_id=top.resource_id,
            slug=top.slug,
            title=top.title,
            description=top.description,
            resource_type=top.resource_type,
            difficulty=top.difficulty,
            estimated_minutes=top.estimated_minutes,
            provider=top.provider,
            url=top.url,
            is_interactive=top.is_interactive,
            target_skill_name=top.target_skill_name or "Core Competency",
            target_skill_slug=top.target_skill_slug or "core-skill",
            current_skill_score=target_skill_score,
            target_milestone_step=learner.active_milestone_step,
            relevance_score=top.relevance_score,
            headline=headline,
            primary_reason=primary_reason,
            reasons=top.explanation_reasons,
            feature_breakdown=top.feature_breakdown
        )
