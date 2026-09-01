import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.skill_repository import SkillRepository
from app.repositories.progress_repository import ProgressRepository
from app.repositories.career_repository import CareerRepository

logger = logging.getLogger("pathpilot.ai.context")

class ContextBuilder:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.learning_path_repo = LearningPathRepository(db)
        self.skill_repo = SkillRepository(db)
        self.progress_repo = ProgressRepository(db)
        self.career_repo = CareerRepository(db)

    async def build_learner_context(self, user_id: str, active_skill_hint: Optional[str] = None) -> Dict[str, Any]:
        """
        Gathers authoritative ground-truth data from PostgreSQL to inject into the LLM context.
        """
        user = await self.user_repo.get_by_id(user_id)
        profile = user.profile if user else None

        # 1. Target Career Context
        target_career_name = "Not Set (Exploring)"
        target_career_slug = None
        target_career_salary = "N/A"
        if profile and profile.target_career:
            target_career_name = profile.target_career.name
            target_career_slug = profile.target_career.slug
            target_career_salary = profile.target_career.salary_range

        # 2. Roadmap Context
        active_path = await self.learning_path_repo.get_active_by_user(user_id)
        milestones_summary = []
        current_milestone_name = active_skill_hint or "None"
        completed_count = 0
        total_milestones = 0

        if active_path and active_path.items:
            total_milestones = len(active_path.items)
            sorted_items = sorted(active_path.items, key=lambda x: x.step_order)
            for item in sorted_items:
                if item.status == "completed":
                    completed_count += 1
                elif item.status == "available" and current_milestone_name in ("None", None):
                    current_milestone_name = item.skill.name if item.skill else f"Step {item.step_order}"
                
                milestones_summary.append({
                    "step": item.step_order,
                    "skill": item.skill.name if item.skill else "Skill",
                    "status": item.status,
                    "category": item.skill.category if item.skill else "General"
                })

        # 3. Assessed Skills & Competencies
        learner_skills = await self.skill_repo.get_learner_skills(user_id)
        assessed_skills_summary = []
        strong_skills = []
        weak_skills = []

        for ls in learner_skills:
            skill_name = ls.skill.name if ls.skill else ls.skill_id
            score = round(ls.score, 1)
            assessed_skills_summary.append({
                "skill": skill_name,
                "score": score,
                "status": ls.status
            })
            if score >= 80:
                strong_skills.append(skill_name)
            elif score < 60:
                weak_skills.append(skill_name)

        # 4. Skill Gap & Career Readiness Analysis
        from app.services.skill_gap.gap_engine import SkillGapEngine
        gap_engine = SkillGapEngine(self.db)
        gap_summary = None
        try:
            gap_summary = await gap_engine.analyze_learner_gaps(
                user_id=user_id,
                target_career_id_or_slug=target_career_slug
            )
        except Exception as e:
            logger.warning(f"Error building skill gap summary for context: {e}")

        # 5. Adaptive Learning State & Recent Adaptations
        from app.models.adaptive import AdaptationEvent
        from sqlalchemy import select
        recent_adaptations = []
        try:
            ev_q = (
                select(AdaptationEvent)
                .where(AdaptationEvent.user_id == user_id)
                .order_by(AdaptationEvent.created_at.desc())
                .limit(3)
            )
            ev_res = await self.db.execute(ev_q)
            for ev in ev_res.scalars().all():
                recent_adaptations.append({
                    "event_type": ev.event_type,
                    "trigger": ev.trigger,
                    "reason": ev.reason
                })
        except Exception as e:
            logger.warning(f"Error fetching adaptations for context: {e}")

        # 6. Study Activity
        activity_logs = await self.progress_repo.get_user_progress(user_id, limit=14)
        total_recent_minutes = sum(p.time_spent_minutes for p in activity_logs)

        has_target_career = bool(profile and (profile.target_career_id or profile.target_career))

        context_data = {
            "user_id": user_id,
            "display_name": user.display_name if user else "Learner",
            "email": user.email if user else "",
            "profile": {
                "has_target_career": has_target_career,
                "target_career": target_career_name if has_target_career else "None Selected",
                "target_career_slug": target_career_slug,
                "salary_range": target_career_salary,
                "experience_level": profile.experience_level if profile else "beginner",
                "learning_pace": profile.learning_pace if profile else "moderate",
                "weekly_hours_goal": profile.weekly_hours_goal if profile else 5,
                "xp": profile.xp if profile else 0,
                "streak_days": profile.streak_days if profile else 1,
            },
            "roadmap": {
                "has_active_roadmap": active_path is not None,
                "career_name": active_path.career.name if active_path and active_path.career else target_career_name,
                "total_milestones": total_milestones,
                "completed_milestones": completed_count,
                "current_active_milestone": current_milestone_name,
                "milestones": milestones_summary
            },
            "skills": {
                "total_assessed": len(assessed_skills_summary),
                "strong_topics": strong_skills,
                "weak_topics": weak_skills,
                "skill_scores": assessed_skills_summary,
                "career_readiness_pct": gap_summary.career_readiness_score if gap_summary else 0.0,
                "confidence_pct": gap_summary.confidence_score if gap_summary else 50.0,
                "is_cold_start": gap_summary.is_cold_start if gap_summary else True,
                "bottlenecks": [b.skill_name for b in gap_summary.bottlenecks] if gap_summary else [],
                "next_best_skill": gap_summary.next_best_skill.skill_name if gap_summary and gap_summary.next_best_skill else None,
                "next_best_skill_reason": gap_summary.next_best_skill.reason if gap_summary and gap_summary.next_best_skill else None
            },
            "adaptations": recent_adaptations,
            "activity": {
                "total_recent_minutes": total_recent_minutes,
                "streak_days": profile.streak_days if profile else 1
            }
        }
        return context_data

    def format_system_prompt(self, context: Dict[str, Any]) -> str:
        """
        Creates an authoritative, grounded system prompt injecting the verified learner state.
        """
        p = context.get("profile", {})
        r = context.get("roadmap", {})
        s = context.get("skills", {})
        act = context.get("activity", {})
        name = context.get("display_name", "Learner")

        weak_str = ", ".join(s.get("weak_topics", [])) or "None identified yet"
        strong_str = ", ".join(s.get("strong_topics", [])) or "None assessed yet"
        bottlenecks_str = ", ".join(s.get("bottlenecks", [])) or "None detected"
        next_best = s.get("next_best_skill") or "N/A"
        next_best_reason = s.get("next_best_skill_reason") or "Complete prerequisite foundation"
        
        milestones_preview = ""
        for m in r.get("milestones", [])[:6]:
            milestones_preview += f"\n  - Step {m['step']}: {m['skill']} [{m['status'].upper()}]"

        return f"""You are PathPilot AI — an elite, compassionate, and technically rigorous AI Learning Navigator & Senior Engineering Mentor.

### CRITICAL GROUNDING RULES (ZERO-HALLUCINATION POLICY):
1. The LLM is NOT the database. You MUST NOT invent, guess, or hallucinate learner scores, completed milestones, diagnostic results, or prerequisites.
2. The authoritative facts below represent the verified database state for the current learner.
3. If the user asks to perform an action (e.g. logging study time, checking prerequisites, querying quizzes, skill gap analysis), ALWAYS use the available backend tools.
4. If you do not know a platform-specific statistic or skill requirement, state that clearly or invoke a tool to retrieve it from PostgreSQL.

### VERIFIED LEARNER PROFILE (PostgreSQL Ground Truth):
- **Learner Name**: {name}
- **Target Career Track**: {p.get('target_career')} ({p.get('salary_range', 'Competitive')})
- **Career Readiness Score**: {s.get('career_readiness_pct', 0.0)}% (Confidence: {s.get('confidence_pct', 50.0)}%)
- **Experience Level**: {p.get('experience_level')} | **Pace**: {p.get('learning_pace')} ({p.get('weekly_hours_goal')} hrs/wk)
- **Gamification**: {p.get('xp')} XP | **Streak**: {act.get('streak_days')} consecutive days | **Recent Study**: {act.get('total_recent_minutes')} mins
- **Active Roadmap Milestone**: {r.get('current_active_milestone')} ({r.get('completed_milestones')}/{r.get('total_milestones')} milestones completed)
- **Authoritative Next Best Skill**: {next_best} — *{next_best_reason}*
- **Identified Bottleneck Skills**: {bottlenecks_str}
- **Identified Weaknesses (Skill Gaps)**: {weak_str}
- **Verified Strengths**: {strong_str}
- **Roadmap Overview**:{milestones_preview if milestones_preview else " No milestones active yet"}

### INSTRUCTIONAL PEDAGOGY & RESPONSE FORMAT:
- Be encouraging, precise, and directly relevant to **{p.get('target_career')}**.
- When explaining concepts, use clear intuitive mental models, followed by real-world production code snippets (Python/SQL/TS), and end with 1 actionable micro-challenge.
- When explaining skill gaps or prerequisites, ground your advice in the verified prerequisite DAG and bottleneck status.
- Format code cleanly inside fenced code blocks with language identifiers.
- Maintain context across the conversation.
"""

