import logging
from typing import Dict, List, Set, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.career_repository import CareerRepository
from app.repositories.skill_repository import SkillRepository
from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.progress_repository import ProgressRepository
from app.repositories.feedback_repository import FeedbackRepository
from app.services.recommendation.types import LearnerState, SkillGapInfo

logger = logging.getLogger("pathpilot.recommendation.state_extractor")

class LearnerStateExtractor:
    """
    Authoritatively constructs a complete, multi-dimensional LearnerState from PostgreSQL ground truth.
    Performs DAG prerequisite dependency resolution, skill gap calculation, and feedback analysis.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.career_repo = CareerRepository(session)
        self.skill_repo = SkillRepository(session)
        self.learning_path_repo = LearningPathRepository(session)
        self.progress_repo = ProgressRepository(session)
        self.feedback_repo = FeedbackRepository(session)

    async def extract_state(self, user_id: str) -> LearnerState:
        # 1. Fetch User & Profile
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found in database")

        profile = user.profile
        exp_level = profile.experience_level if profile else "beginner"
        learning_pace = profile.learning_pace if profile else "moderate"
        pref_format = profile.preferred_format if profile else "interactive"
        weekly_hours = profile.weekly_hours_goal if profile else 5
        xp = profile.xp if profile else 0
        streak = profile.streak_days if profile else 1

        # 2. Fetch Target Career
        target_career = None
        target_career_name = "General Technology Track"
        if profile and profile.target_career_id:
            target_career = await self.career_repo.get_by_id(profile.target_career_id)
            if target_career:
                target_career_name = target_career.name

        # If no career on profile, check active learning path
        active_path = await self.learning_path_repo.get_active_by_user(user_id)
        if not target_career and active_path and active_path.career:
            target_career = active_path.career
            target_career_name = target_career.name

        # Fallback to first career if still none
        if not target_career:
            all_careers = await self.career_repo.get_all()
            if all_careers:
                target_career = all_careers[0]
                target_career_name = target_career.name

        # 3. Use SkillGapEngine for Graph-Aware Analysis
        from app.services.skill_gap.gap_engine import SkillGapEngine
        gap_engine = SkillGapEngine(self.session)
        gap_summary = await gap_engine.analyze_learner_gaps(
            user_id=user_id,
            target_career_id_or_slug=target_career.slug if target_career else None
        )

        # 4. Fetch Assessed Skills & Build Maps
        learner_skills = await self.skill_repo.get_learner_skills(user_id)
        learner_skills_map: Dict[str, float] = {ls.skill_id: ls.score for ls in learner_skills}
        mastered_skill_ids: Set[str] = {ls.skill_id for ls in learner_skills if ls.score >= 85.0}

        # 5. Populate SkillGapInfo from gap_summary
        skill_gaps: List[SkillGapInfo] = []
        unlocked_gap_skill_ids: Set[str] = set()
        blocked_gap_skill_ids: Set[str] = set()
        bottleneck_skill_ids: Set[str] = {b.skill_id for b in gap_summary.bottlenecks}

        for g in gap_summary.skill_gaps:
            info = SkillGapInfo(
                skill_id=g.skill_id,
                skill_slug=g.skill_slug,
                skill_name=g.skill_name,
                category=g.category,
                difficulty=g.difficulty,
                level=g.level,
                current_score=g.current_score,
                target_score=g.target_score,
                career_weight=g.career_weight,
                is_prerequisite_met=g.is_prerequisite_met,
                unsatisfied_prerequisites=g.unsatisfied_prerequisites,
                is_bottleneck=g.is_bottleneck,
                intelligent_priority_score=g.intelligent_priority_score,
                readiness_state=g.readiness_state,
                gap_category=g.gap_category,
                downstream_impact_score=g.downstream_impact_score
            )
            skill_gaps.append(info)

            if g.raw_gap > 0:
                if g.is_prerequisite_met:
                    unlocked_gap_skill_ids.add(g.skill_id)
                else:
                    blocked_gap_skill_ids.add(g.skill_id)

        # Sort by intelligent priority
        skill_gaps.sort(key=lambda x: x.priority_score, reverse=True)

        # 6. Active Roadmap Milestone State
        active_path_id = active_path.id if active_path else None
        active_milestone_skill_id = None
        active_milestone_skill_name = None
        active_milestone_step = None
        roadmap_skill_order = []

        if active_path and active_path.items:
            sorted_items = sorted(active_path.items, key=lambda x: x.step_order)
            for item in sorted_items:
                roadmap_skill_order.append(item.skill_id)
                if item.status in ("available", "in_progress") and active_milestone_skill_id is None:
                    active_milestone_skill_id = item.skill_id
                    active_milestone_step = item.step_order
                    if item.skill:
                        active_milestone_skill_name = item.skill.name

        # If no active milestone set, take Next Best Skill from engine or top unlocked gap
        if not active_milestone_skill_id:
            if gap_summary.next_best_skill and gap_summary.next_best_skill.prerequisites_met:
                active_milestone_skill_id = gap_summary.next_best_skill.skill_id
                active_milestone_skill_name = gap_summary.next_best_skill.skill_name
            elif unlocked_gap_skill_ids:
                top_unlocked = [g for g in skill_gaps if g.is_prerequisite_met and g.gap_magnitude > 0]
                if top_unlocked:
                    active_milestone_skill_id = top_unlocked[0].skill_id
                    active_milestone_skill_name = top_unlocked[0].skill_name

        # 7. History & Progress
        progress_logs = await self.progress_repo.get_user_progress(user_id, limit=30)
        completed_resource_ids = {p.resource_id for p in progress_logs if p.status == "completed"}
        recent_study_minutes = sum(p.time_spent_minutes for p in progress_logs)

        completed_types = []
        for p in progress_logs:
            if p.resource and p.resource.resource_type:
                completed_types.append(p.resource.resource_type)

        # 8. Feedback History
        feedbacks = await self.feedback_repo.get_by_user(user_id)
        disliked_formats = set()
        liked_formats = set()
        feedback_list = []
        for f in feedbacks:
            feedback_list.append({
                "type": f.feedback_type,
                "notes": f.notes,
                "created_at": f.created_at
            })
            if f.feedback_type in ("not_useful", "irrelevant"):
                if f.learning_path_item and f.learning_path_item.resource:
                    disliked_formats.add(f.learning_path_item.resource.resource_type)
            elif f.feedback_type in ("useful", "completed"):
                if f.learning_path_item and f.learning_path_item.resource:
                    liked_formats.add(f.learning_path_item.resource.resource_type)

        next_best_id = gap_summary.next_best_skill.skill_id if gap_summary.next_best_skill else None

        return LearnerState(
            user_id=user.id,
            display_name=user.display_name or "Learner",
            email=user.email,
            experience_level=exp_level,
            learning_pace=learning_pace,
            preferred_format=pref_format,
            weekly_hours_goal=weekly_hours,
            xp=xp,
            streak_days=streak,
            target_career=target_career,
            target_career_name=target_career_name,
            learner_skills_map=learner_skills_map,
            skill_gaps=skill_gaps,
            unlocked_gap_skill_ids=unlocked_gap_skill_ids,
            blocked_gap_skill_ids=blocked_gap_skill_ids,
            bottleneck_skill_ids=bottleneck_skill_ids,
            mastered_skill_ids=mastered_skill_ids,
            next_best_skill_id=next_best_id,
            career_readiness_pct=gap_summary.career_readiness_score,
            confidence_pct=gap_summary.confidence_score,
            is_cold_start=gap_summary.is_cold_start,
            active_path_id=active_path_id,
            active_milestone_skill_id=active_milestone_skill_id,
            active_milestone_skill_name=active_milestone_skill_name,
            active_milestone_step=active_milestone_step,
            roadmap_skill_order=roadmap_skill_order,
            completed_resource_ids=completed_resource_ids,
            completed_resource_types=completed_types,
            recent_study_minutes=recent_study_minutes,
            feedback_history=feedback_list,
            disliked_formats=disliked_formats,
            liked_formats=liked_formats
        )

