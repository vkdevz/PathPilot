from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.progress_repository import ProgressRepository
from app.repositories.user_repository import UserRepository
from app.models.progress import Progress

class ProgressService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.progress_repo = ProgressRepository(db)
        self.user_repo = UserRepository(db)

    async def log_activity(self, user_id: str, resource_id: str, minutes: int, status: str = "completed") -> Progress:
        progress = Progress(
            user_id=user_id,
            resource_id=resource_id,
            time_spent_minutes=minutes,
            status=status,
            completed_at=datetime.now(timezone.utc)
        )
        await self.progress_repo.log_progress(progress)
        # Award XP: 10 XP per 5 minutes learned
        xp_earned = max(10, (minutes // 5) * 10)
        await self.user_repo.add_xp(user_id, xp_earned)
        return progress

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
