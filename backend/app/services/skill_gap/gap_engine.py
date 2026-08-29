import logging
from typing import Dict, List, Set, Optional, Tuple, Any
from dataclasses import dataclass, field
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.skill_repository import SkillRepository
from app.repositories.career_repository import CareerRepository
from app.repositories.user_repository import UserRepository
from app.repositories.assessment_repository import AssessmentRepository
from app.models.skill import Skill, LearnerSkill
from app.models.career import Career, CareerSkill
from app.services.skill_graph.graph_service import SkillGraphService
from app.schemas.skill import (
    IntelligentSkillGapResponse,
    NextBestSkillResponse,
    CareerReadinessSummaryResponse,
)

logger = logging.getLogger("pathpilot.skill_gap")

# Deterministic evidence weight constants
EVIDENCE_WEIGHTS = {
    "assessment": 1.00,
    "verified_practice": 0.85,
    "completed_resource": 0.70,
    "self_report": 0.40,
    "inferred": 0.25,
}

EVIDENCE_CONFIDENCE = {
    "assessment": 0.90,
    "verified_practice": 0.80,
    "completed_resource": 0.65,
    "self_report": 0.35,
    "inferred": 0.20,
}

CAREER_IMPORTANCE_SCORES = {
    "critical": 1.00,
    "high": 0.80,
    "medium": 0.50,
    "low": 0.30,
}

class SkillGapEngine:
    """
    Intelligent graph-aware skill gap and career readiness engine for PathPilot 2.0.
    Combines normalized proficiency models, multi-source evidence weighting,
    DAG prerequisite depth resolution, bottleneck detection, and explainable AI attribution.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.skill_repo = SkillRepository(db)
        self.career_repo = CareerRepository(db)
        self.user_repo = UserRepository(db)
        self.assessment_repo = AssessmentRepository(db)
        self.graph_service = SkillGraphService(db)

    @staticmethod
    def normalize_proficiency(score_0_100: float) -> float:
        """Converts 0-100 score to 0.0-1.0 normalized internal representation."""
        return max(0.0, min(1.0, round(float(score_0_100) / 100.0, 4)))

    @staticmethod
    def to_display_score(proficiency_0_1: float) -> float:
        """Converts 0.0-1.0 normalized proficiency to 0-100 display score."""
        return max(0.0, min(100.0, round(float(proficiency_0_1) * 100.0, 1)))

    def resolve_learner_proficiency(
        self,
        learner_skill: Optional[LearnerSkill]
    ) -> Tuple[float, float, str, bool]:
        """
        Determines calibrated proficiency (0.0-1.0), confidence (0.0-1.0),
        evidence source, and conflict status from multi-source records.
        """
        if not learner_skill:
            return 0.0, 0.20, "inferred", False

        evidence_src = learner_skill.evidence_source or "self_report"
        base_confidence = EVIDENCE_CONFIDENCE.get(evidence_src, 0.40)
        has_conflict = False

        # Check for conflicting evidence (Assessment vs Self-Report)
        if learner_skill.assessment_score is not None and learner_skill.self_reported_score is not None:
            ass_prof = self.normalize_proficiency(learner_skill.assessment_score)
            self_prof = self.normalize_proficiency(learner_skill.self_reported_score)
            delta = abs(ass_prof - self_prof)
            if delta > 0.25:
                has_conflict = True
                # Assessment has 1.0 weight vs self-report 0.3 weight in conflict resolution
                calibrated_prof = round((1.0 * ass_prof + 0.3 * self_prof) / 1.3, 4)
                calibrated_conf = round((EVIDENCE_CONFIDENCE["assessment"] * 0.85), 2)
                return calibrated_prof, calibrated_conf, "assessment_calibrated", has_conflict

        # Single primary source
        if learner_skill.proficiency is not None and learner_skill.proficiency > 0.0:
            prof = float(learner_skill.proficiency)
        else:
            prof = self.normalize_proficiency(learner_skill.score or 0.0)

        conf = float(learner_skill.confidence) if learner_skill.confidence is not None else base_confidence
        return prof, conf, evidence_src, has_conflict

    async def analyze_learner_gaps(
        self,
        user_id: str,
        target_career_id_or_slug: Optional[str] = None
    ) -> CareerReadinessSummaryResponse:
        """
        Performs full graph-aware gap analysis, prerequisite traversal,
        bottleneck detection, and career readiness scoring for the learner.
        """
        await self.graph_service.initialize()

        # 1. Fetch User & Target Career
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")

        career = None
        if target_career_id_or_slug:
            career = await self.career_repo.get_by_slug(target_career_id_or_slug)
            if not career:
                career = await self.career_repo.get_by_id(target_career_id_or_slug)

        if not career and user.profile and user.profile.target_career_id:
            career = await self.career_repo.get_by_id(user.profile.target_career_id)

        if not career:
            all_careers = await self.career_repo.get_all()
            career = all_careers[0] if all_careers else None

        if not career:
            raise ValueError("No career track found in database")

        # 2. Fetch Learner Assessed Skills
        learner_skills = await self.skill_repo.get_learner_skills(user_id)
        learner_skill_map: Dict[str, LearnerSkill] = {ls.skill_id: ls for ls in learner_skills}

        # 3. Career Required Skills & Weights
        career_skills = career.career_skills or []
        career_skill_map: Dict[str, CareerSkill] = {cs.skill_id: cs for cs in career_skills}
        
        # Build career importance mapping for downstream impact calculator
        career_importance_weights: Dict[str, float] = {}
        for cs in career_skills:
            imp = cs.importance or "high"
            career_importance_weights[cs.skill_id] = CAREER_IMPORTANCE_SCORES.get(imp, 0.80)

        # Determine cold start status
        has_assessments = any(ls.evidence_source == "assessment" or ls.assessment_score is not None for ls in learner_skills)
        is_cold_start = not has_assessments and (len(learner_skills) == 0 or all(ls.score == 0.0 for ls in learner_skills))

        # 4. First Pass: Compute Learner Proficiency Map for all skills in graph
        all_skills = self.graph_service.get_all_skills()
        proficiency_map: Dict[str, float] = {}
        confidence_map: Dict[str, float] = {}
        evidence_map: Dict[str, str] = {}
        conflict_map: Dict[str, bool] = {}

        for skill in all_skills:
            ls = learner_skill_map.get(skill.id)
            prof, conf, ev_src, conflict = self.resolve_learner_proficiency(ls)
            proficiency_map[skill.id] = prof
            confidence_map[skill.id] = conf
            evidence_map[skill.id] = ev_src
            conflict_map[skill.id] = conflict

        # 5. Second Pass: Analyze Prerequisites, Gaps, Downstream Impact, and Bottlenecks
        analyzed_gaps: List[IntelligentSkillGapResponse] = []
        bottleneck_skills: List[IntelligentSkillGapResponse] = []
        covered_count = 0
        partial_count = 0
        missing_count = 0
        critical_count = 0
        blocked_count = 0

        # We evaluate all skills in the career curriculum, plus any assessed skills
        eval_skill_ids = set(career_skill_map.keys())
        for ls in learner_skills:
            eval_skill_ids.add(ls.skill_id)

        for skill_id in eval_skill_ids:
            skill = self.graph_service.get_skill(skill_id)
            if not skill:
                continue

            cs = career_skill_map.get(skill.id)
            career_importance = cs.importance if cs else "medium"
            importance_score = CAREER_IMPORTANCE_SCORES.get(career_importance, 0.50)
            career_weight = float(cs.weight) if cs else round(1.0 / max(len(eval_skill_ids), 1), 3)
            target_prof = float(cs.target_proficiency) if cs else 0.85
            target_score = self.to_display_score(target_prof)

            current_prof = proficiency_map.get(skill.id, 0.0)
            current_score = self.to_display_score(current_prof)
            raw_gap = max(0.0, round(target_prof - current_prof, 4))
            conf = confidence_map.get(skill.id, 0.5)
            ev_src = evidence_map.get(skill.id, "inferred")

            # Prerequisite Traversal
            direct_prereqs = self.graph_service.get_direct_prerequisites(skill.id)
            transitive_prereqs = self.graph_service.get_transitive_prerequisites(skill.id)
            prereq_depth = self.graph_service.get_prerequisite_depth(skill.id)
            is_foundation = self.graph_service.is_foundation_skill(skill.id)

            # Check prerequisite satisfaction (threshold = 0.70 / 70%)
            unsatisfied = []
            is_prereq_met = True
            for p in direct_prereqs:
                p_prof = proficiency_map.get(p.id, 0.0)
                if p_prof < 0.70:
                    is_prereq_met = False
                    unsatisfied.append(f"{p.name} ({int(p_prof * 100)}%)")

            # Downstream Impact & Dependents
            downstream_impact = self.graph_service.calculate_downstream_impact(
                skill.id,
                career_importance_weights
            )
            downstream_skills = self.graph_service.get_direct_downstream(skill.id)
            transitive_downstream = self.graph_service.get_transitive_downstream(skill.id)

            # Bottleneck Detection Logic:
            # A skill is a bottleneck if:
            # 1. Current proficiency is weak (< 0.70 or raw_gap >= 0.25)
            # 2. It unlocks >= 1 downstream skill
            # 3. Direct prerequisites of this skill itself are met (or foundation)
            is_bottleneck = False
            if current_prof < 0.70 and len(transitive_downstream) > 0 and is_prereq_met:
                # Check if any downstream skill is part of target career
                downstream_in_career = any(d.id in career_skill_map for d, _ in transitive_downstream)
                if downstream_in_career or downstream_impact >= 0.35:
                    is_bottleneck = True

            # Readiness State Classification
            if current_prof >= target_prof:
                readiness_state = "TARGET_REACHED"
                covered_count += 1
            elif is_prereq_met:
                if raw_gap <= 0.15:
                    readiness_state = "NEAR_TARGET"
                    partial_count += 1
                elif raw_gap <= 0.40:
                    readiness_state = "LEARNING"
                    partial_count += 1
                else:
                    readiness_state = "READY_TO_START"
                    missing_count += 1
            else:
                blocked_count += 1
                if any(self.graph_service.is_foundation_skill(p.id) for p in direct_prereqs):
                    readiness_state = "FOUNDATION_REQUIRED"
                else:
                    readiness_state = "NOT_READY"
                if current_prof < 0.40:
                    missing_count += 1
                else:
                    partial_count += 1

            # Gap Severity Category
            if raw_gap == 0.0:
                gap_category = "NONE"
            elif raw_gap <= 0.20:
                gap_category = "LOW"
            elif raw_gap <= 0.45:
                gap_category = "MODERATE"
            elif raw_gap <= 0.70:
                gap_category = "HIGH"
            else:
                gap_category = "CRITICAL"

            if is_bottleneck and raw_gap >= 0.35:
                gap_category = "CRITICAL"

            if gap_category == "CRITICAL" and cs is not None:
                critical_count += 1

            # Intelligent Priority Score Formula:
            # Base = 0.35 * gap_severity + 0.30 * career_importance + 0.25 * downstream_impact
            gap_severity_norm = min(1.0, raw_gap / 0.85)
            base_priority = (
                0.35 * gap_severity_norm +
                0.30 * importance_score +
                0.25 * downstream_impact +
                0.10 * career_weight
            )

            # Readiness multiplier: 1.0 if ready to learn now, 0.35 if blocked
            readiness_multiplier = 1.0 if is_prereq_met else 0.35
            bottleneck_bonus = 0.20 if is_bottleneck else 0.0

            intelligent_priority = min(1.0, max(0.0, round(
                base_priority * readiness_multiplier + bottleneck_bonus,
                4
            )))

            # Pedagogical Grounded Explanation Construction
            explanation = self._build_explanation(
                skill=skill,
                current_score=current_score,
                target_score=target_score,
                career_importance=career_importance,
                is_bottleneck=is_bottleneck,
                is_prereq_met=is_prereq_met,
                unsatisfied=unsatisfied,
                downstream_count=len(transitive_downstream),
                readiness_state=readiness_state,
                has_conflict=conflict_map.get(skill.id, False)
            )

            gap_item = IntelligentSkillGapResponse(
                skill_id=skill.id,
                skill_slug=skill.slug,
                skill_name=skill.name,
                category=skill.category,
                domain=skill.domain or "General",
                difficulty=skill.difficulty or "Beginner",
                level=skill.level,
                current_proficiency=current_prof,
                current_score=current_score,
                target_proficiency=target_prof,
                target_score=target_score,
                raw_gap=raw_gap,
                confidence=conf,
                evidence_source=ev_src,
                career_importance=career_importance,
                career_importance_score=importance_score,
                career_weight=career_weight,
                prerequisite_depth=prereq_depth,
                is_prerequisite_met=is_prereq_met,
                unsatisfied_prerequisites=unsatisfied,
                transitive_prerequisites_count=len(transitive_prereqs),
                downstream_skills_count=len(transitive_downstream),
                downstream_impact_score=downstream_impact,
                is_bottleneck=is_bottleneck,
                is_foundation=is_foundation,
                readiness_state=readiness_state,
                gap_category=gap_category,
                intelligent_priority_score=intelligent_priority,
                explanation=explanation
            )
            analyzed_gaps.append(gap_item)

            if is_bottleneck:
                bottleneck_skills.append(gap_item)

        # 6. Sort Gaps by Intelligent Priority Score descending
        analyzed_gaps.sort(key=lambda g: g.intelligent_priority_score, reverse=True)
        bottleneck_skills.sort(key=lambda g: g.intelligent_priority_score, reverse=True)

        # 7. Compute Overall Career Readiness Score
        career_readiness_pct, avg_confidence = self._compute_career_readiness(
            career_skills=career_skills,
            analyzed_gaps=analyzed_gaps,
            is_cold_start=is_cold_start
        )

        # 8. Determine Strongest Areas & Biggest Gaps
        strongest = [
            f"{g.skill_name} ({int(g.current_score)}%)"
            for g in sorted(analyzed_gaps, key=lambda x: x.current_proficiency, reverse=True)
            if g.current_proficiency >= 0.70
        ][:3]

        biggest_gaps = [g for g in analyzed_gaps if g.raw_gap > 0.15][:4]

        # 9. Determine Authoritative Next Best Skill
        next_best_skill = self._resolve_next_best_skill(analyzed_gaps, bottleneck_skills)

        return CareerReadinessSummaryResponse(
            career_id=career.id,
            career_slug=career.slug,
            career_name=career.name,
            career_readiness_score=career_readiness_pct,
            confidence_score=avg_confidence,
            is_cold_start=is_cold_start,
            required_skills_count=len(career_skills),
            covered_skills_count=covered_count,
            partial_skills_count=partial_count,
            missing_skills_count=missing_count,
            critical_gaps_count=critical_count,
            blocked_skills_count=blocked_count,
            strongest_skills=strongest,
            biggest_gaps=biggest_gaps,
            bottlenecks=bottleneck_skills,
            next_best_skill=next_best_skill,
            skill_gaps=analyzed_gaps
        )

    def _compute_career_readiness(
        self,
        career_skills: List[CareerSkill],
        analyzed_gaps: List[IntelligentSkillGapResponse],
        is_cold_start: bool
    ) -> Tuple[float, float]:
        """
        Calculates calibrated career readiness score (0 - 100%) and overall confidence.
        Uses importance weighting and penalties for blocked critical skills.
        """
        if not career_skills:
            return 0.0, 20.0

        gap_by_id = {g.skill_id: g for g in analyzed_gaps}
        total_weighted_prof = 0.0
        total_weight = 0.0
        conf_sum = 0.0
        critical_unmet_count = 0

        for cs in career_skills:
            imp_score = CAREER_IMPORTANCE_SCORES.get(cs.importance or "high", 0.80)
            target_p = cs.target_proficiency or 0.85
            gap_item = gap_by_id.get(cs.skill_id)

            if gap_item:
                # Ratio achieved toward target
                ratio = min(1.0, gap_item.current_proficiency / max(0.01, target_p))
                total_weighted_prof += ratio * imp_score
                conf_sum += gap_item.confidence
                if not gap_item.is_prerequisite_met and cs.importance in ("critical", "high"):
                    critical_unmet_count += 1
            else:
                conf_sum += 0.20

            total_weight += imp_score

        base_readiness = (total_weighted_prof / max(0.01, total_weight)) * 100.0

        # Blocker penalty: each unmet critical prerequisite incurs a 5% readiness penalty
        penalty_factor = max(0.65, 1.0 - 0.05 * min(4, critical_unmet_count))
        final_readiness = round(base_readiness * penalty_factor, 1)

        avg_conf = (conf_sum / max(1, len(career_skills))) * 100.0
        if is_cold_start:
            avg_conf = min(avg_conf, 30.0)

        return final_readiness, round(avg_conf, 1)

    def _resolve_next_best_skill(
        self,
        analyzed_gaps: List[IntelligentSkillGapResponse],
        bottlenecks: List[IntelligentSkillGapResponse]
    ) -> Optional[NextBestSkillResponse]:
        """
        Determines the single most strategic and pedagogically sound Next Best Skill.
        Prioritizes unblocking bottlenecks first, then highest priority unlocked gaps.
        """
        # 1. Unlocked Bottlenecks have absolute highest priority
        unlocked_bottlenecks = [b for b in bottlenecks if b.is_prerequisite_met and b.raw_gap > 0.15]
        if unlocked_bottlenecks:
            target = unlocked_bottlenecks[0]
            reason = (
                f"Prioritized as your key prerequisite bottleneck for {target.skill_name}. "
                f"Improving from {int(target.current_score)}% to {int(target.target_score)}% unlocks "
                f"{target.downstream_skills_count} downstream career competencies."
            )
            return NextBestSkillResponse(
                skill_id=target.skill_id,
                skill_slug=target.skill_slug,
                skill_name=target.skill_name,
                category=target.category,
                domain=target.domain,
                difficulty=target.difficulty,
                priority_score=target.intelligent_priority_score,
                is_bottleneck=True,
                readiness_state=target.readiness_state,
                reason=reason,
                prerequisites_met=True
            )

        # 2. Highest priority unlocked skill gap
        unlocked_gaps = [g for g in analyzed_gaps if g.is_prerequisite_met and g.raw_gap > 0.15]
        if unlocked_gaps:
            target = unlocked_gaps[0]
            reason = (
                f"Next strategic priority in your curriculum with {target.career_importance} career alignment. "
                f"Current score is {int(target.current_score)}% vs target benchmark {int(target.target_score)}%."
            )
            return NextBestSkillResponse(
                skill_id=target.skill_id,
                skill_slug=target.skill_slug,
                skill_name=target.skill_name,
                category=target.category,
                domain=target.domain,
                difficulty=target.difficulty,
                priority_score=target.intelligent_priority_score,
                is_bottleneck=False,
                readiness_state=target.readiness_state,
                reason=reason,
                prerequisites_met=True
            )

        # 3. If all unlocked skills are mastered, find closest skill to unlock
        if analyzed_gaps:
            target = analyzed_gaps[0]
            return NextBestSkillResponse(
                skill_id=target.skill_id,
                skill_slug=target.skill_slug,
                skill_name=target.skill_name,
                category=target.category,
                domain=target.domain,
                difficulty=target.difficulty,
                priority_score=target.intelligent_priority_score,
                is_bottleneck=target.is_bottleneck,
                readiness_state=target.readiness_state,
                reason=target.explanation,
                prerequisites_met=target.is_prerequisite_met
            )

        return None

    def _build_explanation(
        self,
        skill: Skill,
        current_score: float,
        target_score: float,
        career_importance: str,
        is_bottleneck: bool,
        is_prereq_met: bool,
        unsatisfied: List[str],
        downstream_count: int,
        readiness_state: str,
        has_conflict: bool
    ) -> str:
        """Constructs human-readable, verifiable pedagogical reasoning."""
        if current_score >= target_score:
            return f"Mastered competency ({int(current_score)}% vs {int(target_score)}% target). Meets career requirements."

        parts = []
        if is_bottleneck:
            parts.append(f"Strategic prerequisite bottleneck unlocking {downstream_count} downstream skills.")

        if not is_prereq_met:
            parts.append(f"Locked until prerequisites are satisfied: {', '.join(unsatisfied)}.")
        else:
            parts.append("Prerequisites met and ready to advance.")

        parts.append(f"Career alignment: {career_importance.capitalize()}.")

        if has_conflict:
            parts.append("Note: Diagnostic quiz score prioritized over self-reported baseline.")

        return " ".join(parts)
