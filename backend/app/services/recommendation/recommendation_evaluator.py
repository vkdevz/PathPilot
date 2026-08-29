import logging
import time
import random
import math
from typing import Dict, List, Any, Set, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.resource import Resource, ResourceSkill
from app.models.skill import Skill
from app.models.career import Career
from app.models.user import User, LearnerProfile
from app.models.learning_path import LearningPath, LearningPathItem
from app.services.recommendation.types import LearnerState, CandidateResource, ScoredCandidate, SkillGapInfo
from app.services.recommendation.recommendation_engine import HybridRecommendationEngine
from app.services.recommendation.diversity_ranker import DiversityRanker
from app.schemas.recommendation import BaselineComparisonMetric, RecommendationEvaluationReport

logger = logging.getLogger("pathpilot.recommendation.evaluator")

class RecommendationEvaluator:
    """
    Offline evaluation and benchmarking framework for recommendation algorithms.
    Compares Hybrid Engine against Random, Popularity, Semantic-Only, and Rule-Only baselines.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.hybrid_engine = HybridRecommendationEngine(session)
        self.ranker = DiversityRanker()

    async def evaluate_suite(self, k: int = 5) -> Dict[str, Any]:
        start_time = time.time()
        
        # 1. Fetch all catalog resources & skills
        stmt_res = select(Resource).options(selectinload(Resource.resource_skills).selectinload(ResourceSkill.skill))
        res_all = await self.session.execute(stmt_res)
        all_resources = list(res_all.scalars().all())

        stmt_skills = select(Skill).options(selectinload(Skill.prerequisites))
        res_skills = await self.session.execute(stmt_skills)
        all_skills = list(res_skills.scalars().all())

        stmt_careers = select(Career).options(selectinload(Career.career_skills))
        res_careers = await self.session.execute(stmt_careers)
        all_careers = list(res_careers.scalars().all())

        # 2. Build benchmark synthetic test archetypes representing realistic learner profiles
        test_archetypes = self._generate_test_learner_archetypes(all_skills, all_careers)

        # 3. Evaluate each model
        models = ["random", "popularity", "semantic_only", "rule_only", "hybrid_ai"]
        model_metrics: Dict[str, Dict[str, List[float]]] = {
            m: {
                "precision": [],
                "recall": [],
                "ndcg": [],
                "ild": [],
                "prereq_violations": [],
                "latency": [],
                "recommended_ids": set()
            }
            for m in models
        }

        for learner in test_archetypes:
            # Ground truth relevant skills for this learner
            unlocked_gaps = {g.skill_id for g in learner.skill_gaps if g.is_prerequisite_met and g.gap_magnitude > 0}
            active_milestone_id = learner.active_milestone_skill_id

            for model_name in models:
                t0 = time.time()
                rec_resources = await self._run_model(model_name, learner, all_resources, k)
                lat_ms = (time.time() - t0) * 1000.0

                # Metrics computation
                p_at_k = self._calc_precision(rec_resources, unlocked_gaps, active_milestone_id, k)
                r_at_k = self._calc_recall(rec_resources, unlocked_gaps, active_milestone_id)
                ndcg_at_k = self._calc_ndcg(rec_resources, unlocked_gaps, active_milestone_id, learner.blocked_gap_skill_ids, k)
                ild = self._calc_ild(rec_resources)
                prereq_violation = self._calc_prereq_violation(rec_resources, learner.blocked_gap_skill_ids)

                model_metrics[model_name]["precision"].append(p_at_k)
                model_metrics[model_name]["recall"].append(r_at_k)
                model_metrics[model_name]["ndcg"].append(ndcg_at_k)
                model_metrics[model_name]["ild"].append(ild)
                model_metrics[model_name]["prereq_violations"].append(prereq_violation)
                model_metrics[model_name]["latency"].append(lat_ms)
                for r in rec_resources:
                    model_metrics[model_name]["recommended_ids"].add(r.id)

        # 4. Aggregate metrics
        catalog_total = max(len(all_resources), 1)
        comparison_results: List[BaselineComparisonMetric] = []

        for m_name in models:
            metrics = model_metrics[m_name]
            avg_p = sum(metrics["precision"]) / len(metrics["precision"])
            avg_r = sum(metrics["recall"]) / len(metrics["recall"])
            avg_ndcg = sum(metrics["ndcg"]) / len(metrics["ndcg"])
            avg_ild = sum(metrics["ild"]) / len(metrics["ild"])
            avg_prereq_v = sum(metrics["prereq_violations"]) / len(metrics["prereq_violations"])
            avg_lat = sum(metrics["latency"]) / len(metrics["latency"])
            coverage = (len(metrics["recommended_ids"]) / catalog_total) * 100.0

            display_names = {
                "random": "Random Baseline",
                "popularity": "Popularity / Static Baseline",
                "semantic_only": "Semantic-Only Baseline",
                "rule_only": "Rule / Skill-Gap Only Baseline",
                "hybrid_ai": "PathPilot Hybrid AI Engine"
            }

            comparison_results.append(BaselineComparisonMetric(
                model_name=display_names.get(m_name, m_name),
                precision_at_k=round(avg_p, 4),
                recall_at_k=round(avg_r, 4),
                ndcg_at_k=round(avg_ndcg, 4),
                intra_list_diversity=round(avg_ild, 4),
                catalog_coverage_pct=round(coverage, 2),
                prerequisite_violation_rate=round(avg_prereq_v, 4),
                avg_latency_ms=round(avg_lat, 2)
            ))

        total_duration = round((time.time() - start_time) * 1000, 2)
        hybrid_metric = next(c for c in comparison_results if "Hybrid" in c.model_name)

        return {
            "status": "completed",
            "k": k,
            "total_test_learners": len(test_archetypes),
            "comparison": [c.model_dump() for c in comparison_results],
            "hybrid_summary": {
                "precision_at_k": hybrid_metric.precision_at_k,
                "recall_at_k": hybrid_metric.recall_at_k,
                "ndcg_at_k": hybrid_metric.ndcg_at_k,
                "intra_list_diversity": hybrid_metric.intra_list_diversity,
                "prerequisite_violation_rate": hybrid_metric.prerequisite_violation_rate,
                "catalog_coverage_pct": hybrid_metric.catalog_coverage_pct,
                "avg_latency_ms": hybrid_metric.avg_latency_ms
            },
            "total_duration_ms": total_duration
        }

    async def _run_model(
        self,
        model_name: str,
        learner: LearnerState,
        all_resources: List[Resource],
        k: int
    ) -> List[Resource]:
        if model_name == "random":
            return random.sample(all_resources, min(k, len(all_resources)))

        elif model_name == "popularity":
            # Static ordering by beginner/intermediate
            sorted_res = sorted(all_resources, key=lambda r: (r.difficulty == "Beginner", r.is_interactive), reverse=True)
            return sorted_res[:k]

        elif model_name == "semantic_only":
            # Pure vector match with query
            query = f"{learner.target_career_name} {learner.active_milestone_skill_name or ''}"
            res_items = await self.hybrid_engine.candidate_generator.retrieval_service.search_resources(query, limit=k)
            retrieved_ids = [item["id"] for item in res_items]
            return [r for r in all_resources if r.id in retrieved_ids][:k]

        elif model_name == "rule_only":
            # Matches top skill gap without semantic or diversity re-ranking
            unlocked_gaps = [g.skill_id for g in learner.skill_gaps if g.is_prerequisite_met and g.gap_magnitude > 0]
            matched = []
            for r in all_resources:
                r_skills = [rs.skill_id for rs in r.resource_skills]
                if any(sid in unlocked_gaps for sid in r_skills):
                    matched.append(r)
            return (matched + all_resources)[:k]

        elif model_name == "hybrid_ai":
            # Full Hybrid AI Recommendation Pipeline
            candidates = await self.hybrid_engine.candidate_generator.generate_candidates(learner, limit=30)
            filtered = self.hybrid_engine.constraint_filter.apply_filters(candidates, learner)
            scored = [self.hybrid_engine.feature_extractor.extract_features(c, learner) for c in filtered]
            scored = self.hybrid_engine.scorer.score_all(scored)
            top_scored = self.hybrid_engine.ranker.rank_and_diversify(scored, top_k=k)
            return [c.candidate.resource for c in top_scored]

        return all_resources[:k]

    def _calc_precision(self, recs: List[Resource], unlocked_gaps: Set[str], active_milestone_id: Optional[str], k: int) -> float:
        if not recs:
            return 0.0
        relevant_count = 0
        for r in recs:
            r_skills = {rs.skill_id for rs in r.resource_skills}
            if active_milestone_id and active_milestone_id in r_skills:
                relevant_count += 1
            elif r_skills.intersection(unlocked_gaps):
                relevant_count += 1
        return relevant_count / min(k, len(recs))

    def _calc_recall(self, recs: List[Resource], unlocked_gaps: Set[str], active_milestone_id: Optional[str]) -> float:
        target_skills = set(unlocked_gaps)
        if active_milestone_id:
            target_skills.add(active_milestone_id)
        if not target_skills:
            return 1.0

        covered_skills = set()
        for r in recs:
            r_skills = {rs.skill_id for rs in r.resource_skills}
            covered_skills.update(r_skills.intersection(target_skills))

        return len(covered_skills) / len(target_skills)

    def _calc_ndcg(
        self,
        recs: List[Resource],
        unlocked_gaps: Set[str],
        active_milestone_id: Optional[str],
        blocked_skill_ids: Set[str],
        k: int
    ) -> float:
        if not recs:
            return 0.0

        dcg = 0.0
        gains = []
        for i, r in enumerate(recs[:k]):
            r_skills = {rs.skill_id for rs in r.resource_skills}
            rel = 0
            if active_milestone_id and active_milestone_id in r_skills:
                rel = 3 # Highest relevance
            elif r_skills.intersection(unlocked_gaps):
                rel = 2 # High priority unlocked gap
            elif r_skills.intersection(blocked_skill_ids):
                rel = 0 # Blocked prerequisite violation
            else:
                rel = 1 # Exploratory domain relevance

            gains.append(rel)
            dcg += (2 ** rel - 1) / math.log2(i + 2)

        ideal_gains = sorted(gains, reverse=True)
        idcg = sum((2 ** rel - 1) / math.log2(i + 2) for i, rel in enumerate(ideal_gains))
        if idcg == 0.0:
            return 0.0
        return dcg / idcg

    def _calc_ild(self, recs: List[Resource]) -> float:
        if len(recs) <= 1:
            return 1.0
        total_dist = 0.0
        pairs = 0
        for i in range(len(recs)):
            for j in range(i + 1, len(recs)):
                s1 = {rs.skill_id for rs in recs[i].resource_skills}
                s2 = {rs.skill_id for rs in recs[j].resource_skills}
                overlap = len(s1.intersection(s2)) / len(s1.union(s2)) if s1.union(s2) else 0.0
                type_sim = 1.0 if recs[i].resource_type == recs[j].resource_type else 0.0
                dist = 1.0 - (0.7 * overlap + 0.3 * type_sim)
                total_dist += dist
                pairs += 1
        return round(total_dist / pairs, 4) if pairs else 1.0

    def _calc_prereq_violation(self, recs: List[Resource], blocked_skill_ids: Set[str]) -> float:
        if not recs:
            return 0.0
        violations = 0
        for r in recs:
            r_skills = {rs.skill_id for rs in r.resource_skills}
            if r_skills and all(sid in blocked_skill_ids for sid in r_skills):
                violations += 1
        return violations / len(recs)

    def _generate_test_learner_archetypes(
        self,
        all_skills: List[Skill],
        all_careers: List[Career]
    ) -> List[LearnerState]:
        archetypes = []
        skill_by_id = {s.id: s for s in all_skills}

        # Archetype 1: Complete Beginner in Data Science
        ds_career = next((c for c in all_careers if "data" in c.slug.lower() or "ai" in c.slug.lower()), all_careers[0])
        skills_map_1 = {}
        unlocked_gaps_1 = set()
        blocked_gaps_1 = set()
        gaps_1 = []
        for sk in all_skills:
            score = 20.0 if "intro" in sk.slug or "python" in sk.slug else 0.0
            skills_map_1[sk.id] = score
            has_prereqs = bool(sk.prerequisites)
            if has_prereqs and score < 70.0:
                blocked_gaps_1.add(sk.id)
            else:
                unlocked_gaps_1.add(sk.id)
            gaps_1.append(SkillGapInfo(
                skill_id=sk.id,
                skill_slug=sk.slug,
                skill_name=sk.name,
                category=sk.category,
                difficulty=sk.difficulty,
                level=sk.level,
                current_score=score,
                target_score=85.0,
                is_prerequisite_met=not has_prereqs or score >= 70.0
            ))

        archetypes.append(LearnerState(
            user_id="test-learner-beginner",
            display_name="Alex (Beginner Data Scientist)",
            email="alex.beginner@test.com",
            experience_level="beginner",
            learning_pace="moderate",
            preferred_format="interactive",
            weekly_hours_goal=5,
            xp=150,
            streak_days=3,
            target_career=ds_career,
            target_career_name=ds_career.name,
            learner_skills_map=skills_map_1,
            skill_gaps=gaps_1,
            unlocked_gap_skill_ids=unlocked_gaps_1,
            blocked_gap_skill_ids=blocked_gaps_1,
            active_milestone_skill_id=all_skills[0].id if all_skills else None,
            active_milestone_skill_name=all_skills[0].name if all_skills else None,
            active_milestone_step=1,
            roadmap_skill_order=[s.id for s in all_skills[:4]]
        ))

        # Archetype 2: Intermediate Full Stack Web Dev
        fs_career = next((c for c in all_careers if "web" in c.slug.lower() or "full" in c.slug.lower()), all_careers[-1])
        skills_map_2 = {}
        unlocked_gaps_2 = set()
        blocked_gaps_2 = set()
        gaps_2 = []
        for i, sk in enumerate(all_skills):
            score = 80.0 if i % 2 == 0 else 40.0
            skills_map_2[sk.id] = score
            if score < 70.0:
                unlocked_gaps_2.add(sk.id)
            gaps_2.append(SkillGapInfo(
                skill_id=sk.id,
                skill_slug=sk.slug,
                skill_name=sk.name,
                category=sk.category,
                difficulty=sk.difficulty,
                level=sk.level,
                current_score=score,
                target_score=85.0,
                is_prerequisite_met=True
            ))

        archetypes.append(LearnerState(
            user_id="test-learner-intermediate",
            display_name="Taylor (Intermediate Full Stack)",
            email="taylor.intermediate@test.com",
            experience_level="intermediate",
            learning_pace="intensive",
            preferred_format="projects",
            weekly_hours_goal=10,
            xp=800,
            streak_days=12,
            target_career=fs_career,
            target_career_name=fs_career.name,
            learner_skills_map=skills_map_2,
            skill_gaps=gaps_2,
            unlocked_gap_skill_ids=unlocked_gaps_2,
            blocked_gap_skill_ids=blocked_gaps_2,
            active_milestone_skill_id=all_skills[1].id if len(all_skills) > 1 else None,
            active_milestone_skill_name=all_skills[1].name if len(all_skills) > 1 else None,
            active_milestone_step=2,
            roadmap_skill_order=[s.id for s in all_skills]
        ))

        return archetypes
