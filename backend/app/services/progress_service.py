from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.progress_repository import ProgressRepository
from app.repositories.user_repository import UserRepository
from app.repositories.resource_repository import ResourceRepository
from app.models.progress import Progress, StudySession

class ProgressService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.progress_repo = ProgressRepository(db)
        self.user_repo = UserRepository(db)
        self.resource_repo = ResourceRepository(db)

    # ── 1. Study Sessions (Manually Logged Focused Learning) ──
    async def log_study_session(
        self,
        user_id: str,
        topic: str,
        duration_minutes: int,
        resource_id: Optional[str] = None,
        session_date: Optional[datetime] = None,
        notes: Optional[str] = None
    ) -> StudySession:
        """
        Records a manually logged study session.
        Calculates session XP and increments user profile XP.
        Does NOT alter resource completion state.
        """
        # Resolve real resource if passed
        target_res_id = None
        if resource_id:
            real_res = await self.resource_repo.get_by_id_or_slug(resource_id)
            if real_res:
                target_res_id = real_res.id
                if not topic:
                    topic = real_res.title

        # Defined XP Rule: 10 XP per 15 minutes of study, minimum 5 XP, capped at 50 XP per session
        xp_earned = min(50, max(5, (duration_minutes // 15) * 10))

        if not session_date:
            session_date = datetime.now(timezone.utc)
        elif session_date.tzinfo is None:
            session_date = session_date.replace(tzinfo=timezone.utc)

        session = StudySession(
            user_id=user_id,
            resource_id=target_res_id,
            topic=topic,
            duration_minutes=duration_minutes,
            session_date=session_date,
            notes=notes,
            xp_earned=xp_earned
        )
        await self.progress_repo.create_study_session(session)

        # Authoritatively persist XP to PostgreSQL
        await self.user_repo.add_xp(user_id, xp_earned)

        return session

    async def get_study_sessions(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        sessions = await self.progress_repo.get_study_sessions(user_id, limit=limit)
        results = []
        for s in sessions:
            results.append({
                "id": s.id,
                "user_id": s.user_id,
                "topic": s.topic,
                "duration_minutes": s.duration_minutes,
                "session_date": s.session_date,
                "notes": s.notes,
                "xp_earned": s.xp_earned,
                "resource_id": s.resource_id,
                "created_at": s.created_at
            })
        return results

    async def get_study_time_summary(self, user_id: str) -> Dict[str, Any]:
        """
        Computes accurate study time metrics from real database sessions.
        """
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=now.weekday())
        month_start = today_start.replace(day=1)

        all_sessions = await self.progress_repo.get_all_study_sessions(user_id)

        today_mins = 0
        week_mins = 0
        week_count = 0
        month_mins = 0
        total_mins = 0
        total_count = len(all_sessions)

        for s in all_sessions:
            s_date = s.session_date
            if s_date.tzinfo is None:
                s_date = s_date.replace(tzinfo=timezone.utc)

            mins = s.duration_minutes
            total_mins += mins

            if s_date >= today_start:
                today_mins += mins
            if s_date >= week_start:
                week_mins += mins
                week_count += 1
            if s_date >= month_start:
                month_mins += mins

        user = await self.user_repo.get_by_id(user_id)
        total_xp = user.profile.xp if user and user.profile else 0
        streak_days = user.profile.streak_days if user and user.profile else 1

        return {
            "today_minutes": today_mins,
            "this_week_minutes": week_mins,
            "this_week_sessions": week_count,
            "this_month_minutes": month_mins,
            "total_minutes": total_mins,
            "total_sessions": total_count,
            "total_xp": total_xp,
            "streak_days": streak_days
        }

    # ── 2. Verified Resource Completion (Authoritative & Idempotent) ──
    async def complete_resource(
        self,
        user_id: str,
        resource_id: str,
        time_spent_minutes: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Marks a learning resource as verified completed.
        Enforces idempotency: awards completion XP exactly once.
        """
        real_resource = await self.resource_repo.get_by_id_or_slug(resource_id)
        target_res_id = real_resource.id if real_resource else resource_id
        res_title = real_resource.title if real_resource else "Learning Module"
        res_type = real_resource.resource_type.capitalize() if real_resource else "Course"

        # Check existing completion to prevent duplicate XP
        existing = await self.progress_repo.get_completed_by_resource(user_id, target_res_id)
        if existing:
            return {
                "id": existing.id,
                "user_id": user_id,
                "resource_id": target_res_id,
                "resource_title": res_title,
                "resource_type": res_type,
                "status": "completed",
                "xp_earned": 0,
                "already_completed": True,
                "completed_at": existing.completed_at or existing.created_at
            }

        # Defined Completion XP: 50 XP for verified completion
        completion_xp = 50
        mins = time_spent_minutes if time_spent_minutes is not None else (real_resource.estimated_minutes if real_resource else 30)

        now = datetime.now(timezone.utc)
        progress = Progress(
            user_id=user_id,
            resource_id=target_res_id,
            time_spent_minutes=mins,
            status="completed",
            completed_at=now,
            xp_earned=completion_xp
        )
        await self.progress_repo.log_progress(progress)

        # Authoritatively persist completion XP to PostgreSQL
        await self.user_repo.add_xp(user_id, completion_xp)

        # Ingest verified evidence into Adaptive Learning Engine
        if real_resource and real_resource.resource_skills:
            try:
                from app.services.adaptive.adaptive_service import AdaptiveLearningService
                adaptive_svc = AdaptiveLearningService(self.db)
                for rs in real_resource.resource_skills:
                    await adaptive_svc.ingest_evidence_and_adapt(
                        user_id=user_id,
                        skill_id=rs.skill_id,
                        evidence_type="RESOURCE_COMPLETION",
                        score=0.95,
                        raw_score=100.0,
                        source_id=f"completion_{progress.id}",
                        metadata={"resource_title": real_resource.title, "minutes": mins}
                    )
            except Exception:
                pass

        return {
            "id": progress.id,
            "user_id": user_id,
            "resource_id": target_res_id,
            "resource_title": res_title,
            "resource_type": res_type,
            "status": "completed",
            "xp_earned": completion_xp,
            "already_completed": False,
            "completed_at": now
        }

    async def log_activity(self, user_id: str, resource_id: str, minutes: int, status: str = "completed") -> Progress:
        """
        Legacy activity logging support for backwards compatibility.
        """
        if status == "completed":
            res_dict = await self.complete_resource(user_id, resource_id, time_spent_minutes=minutes)
            return Progress(
                id=res_dict["id"],
                user_id=user_id,
                resource_id=res_dict["resource_id"],
                time_spent_minutes=minutes,
                status="completed",
                completed_at=res_dict["completed_at"],
                xp_earned=res_dict["xp_earned"]
            )
        else:
            real_res = await self.resource_repo.get_by_id_or_slug(resource_id)
            target_res_id = real_res.id if real_res else resource_id
            session = await self.log_study_session(
                user_id=user_id,
                topic=real_res.title if real_res else "Study Session",
                duration_minutes=minutes,
                resource_id=target_res_id
            )
            return Progress(
                id=session.id,
                user_id=user_id,
                resource_id=target_res_id,
                time_spent_minutes=minutes,
                status="in_progress",
                completed_at=None,
                xp_earned=session.xp_earned
            )

    async def get_completed_learning(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        logs = await self.progress_repo.get_completed_resources(user_id, limit=limit)
        results = []
        for log in logs:
            res_title = log.resource.title if log.resource else "Verified Learning Module"
            res_type = log.resource.resource_type.capitalize() if log.resource else "Course"
            res_slug = log.resource.slug if log.resource else None
            skills = [rs.skill.name for rs in log.resource.resource_skills if rs.skill] if log.resource else []
            xp_earned = getattr(log, "xp_earned", 50) or 50

            results.append({
                "id": log.id,
                "resource_id": log.resource_id,
                "resource_title": res_title,
                "resource_type": res_type,
                "resource_slug": res_slug,
                "skills_taught": skills,
                "time_spent_minutes": log.time_spent_minutes,
                "xp_earned": xp_earned,
                "status": log.status,
                "completed_at": log.completed_at or log.created_at
            })
        return results

    async def get_heatmap(self, user_id: str, days: int = 28) -> List[Dict[str, Any]]:
        """
        Builds 28-day heatmap from real study sessions and completed resources.
        """
        since = datetime.now(timezone.utc) - timedelta(days=days)
        study_sessions = await self.progress_repo.get_study_sessions_in_range(user_id, since=since)
        completed_logs = await self.progress_repo.get_user_activity_days(user_id, days=days)

        day_minutes_map: Dict[str, int] = {}
        for s in study_sessions:
            d_str = s.session_date.strftime("%Y-%m-%d")
            day_minutes_map[d_str] = day_minutes_map.get(d_str, 0) + s.duration_minutes

        for log in completed_logs:
            d_str = log.created_at.strftime("%Y-%m-%d")
            # Only add if not already covered by study session on that day
            if d_str not in day_minutes_map:
                day_minutes_map[d_str] = day_minutes_map.get(d_str, 0) + log.time_spent_minutes

        heatmap = []
        today = datetime.now(timezone.utc).date()
        for i in range(days - 1, -1, -1):
            d = today - timedelta(days=i)
            d_str = d.strftime("%Y-%m-%d")
            minutes = day_minutes_map.get(d_str, 0)

            if minutes >= 45:
                intensity = 3
            elif minutes >= 20:
                intensity = 2
            elif minutes > 0:
                intensity = 1
            else:
                intensity = 0

            heatmap.append({
                "date": d_str,
                "minutes": minutes,
                "intensity": intensity
            })

        return heatmap

    async def get_leaderboard(self, current_user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        rows = await self.user_repo.get_leaderboard(limit=limit)
        leaderboard = []
        for rank, (user, profile) in enumerate(rows, start=1):
            career_name = profile.target_career.name if profile.target_career else "Technology Track"
            leaderboard.append({
                "rank": rank,
                "user_id": user.id,
                "name": user.display_name or "Learner",
                "xp": profile.xp,
                "streak": profile.streak_days,
                "career": career_name,
                "is_current": (user.id == current_user_id)
            })
        return leaderboard
