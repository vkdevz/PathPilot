from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.progress_repository import ProgressRepository
from app.repositories.user_repository import UserRepository
from app.models.progress import Progress

from app.repositories.resource_repository import ResourceRepository

class ProgressService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.progress_repo = ProgressRepository(db)
        self.user_repo = UserRepository(db)
        self.resource_repo = ResourceRepository(db)

    async def log_activity(self, user_id: str, resource_id: str, minutes: int, status: str = "completed") -> Progress:
        # Resolve resource by ID or slug
        real_resource = await self.resource_repo.get_by_id_or_slug(resource_id)
        target_res_id = real_resource.id if real_resource else resource_id

        progress = Progress(
            user_id=user_id,
            resource_id=target_res_id,
            time_spent_minutes=minutes,
            status=status,
            completed_at=datetime.now(timezone.utc)
        )
        await self.progress_repo.log_progress(progress)
        
        # Award XP: 10 XP per 5 minutes learned, minimum 20 XP
        xp_earned = max(20, (minutes // 5) * 10)
        await self.user_repo.add_xp(user_id, xp_earned)

        # Ingest evidence into Adaptive Learning Engine if resource has associated skills
        if real_resource and real_resource.resource_skills:
            try:
                from app.services.adaptive.adaptive_service import AdaptiveLearningService
                adaptive_svc = AdaptiveLearningService(self.db)
                for rs in real_resource.resource_skills:
                    await adaptive_svc.ingest_evidence_and_adapt(
                        user_id=user_id,
                        skill_id=rs.skill_id,
                        evidence_type="RESOURCE_COMPLETION",
                        score=0.90 if status == "completed" else 0.70,
                        raw_score=100.0 if status == "completed" else 70.0,
                        source_id=f"progress_{progress.id}",
                        metadata={"resource_title": real_resource.title, "minutes": minutes}
                    )
            except Exception as e:
                # Log adaptive ingestion non-blocking
                pass

        return progress

    async def get_completed_learning(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        logs = await self.progress_repo.get_completed_resources(user_id, limit=limit)
        results = []
        for log in logs:
            res_title = log.resource.title if log.resource else "Interactive Module"
            res_type = log.resource.resource_type.capitalize() if log.resource else "Course"
            res_slug = log.resource.slug if log.resource else None
            skills = [rs.skill.name for rs in log.resource.resource_skills if rs.skill] if log.resource else []
            xp_earned = max(20, (log.time_spent_minutes // 5) * 10)

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
        logs = await self.progress_repo.get_user_activity_days(user_id, days=days)
        # Build 28-day map
        heatmap = []
        today = datetime.now(timezone.utc).date()

        day_minutes_map: Dict[str, int] = {}
        for log in logs:
            day_str = log.created_at.strftime("%Y-%m-%d")
            day_minutes_map[day_str] = day_minutes_map.get(day_str, 0) + log.time_spent_minutes

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
