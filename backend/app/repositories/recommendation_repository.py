import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.models.recommendation import RecommendationLog, RecommendationFeedback

logger = logging.getLogger("pathpilot.repository.recommendation")

class RecommendationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_recommendation_run(self, log: RecommendationLog) -> RecommendationLog:
        """Persists a recommendation generation event with full feature telemetry."""
        self.db.add(log)
        await self.db.flush()
        return log

    async def get_latest_recommendation_log(self, user_id: str) -> Optional[RecommendationLog]:
        """Retrieves the most recent recommendation run for a learner."""
        stmt = (
            select(RecommendationLog)
            .options(
                selectinload(RecommendationLog.target_career),
                selectinload(RecommendationLog.top_resource)
            )
            .where(RecommendationLog.user_id == user_id)
            .order_by(RecommendationLog.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def record_feedback(self, feedback: RecommendationFeedback) -> RecommendationFeedback:
        """Records learner interaction or feedback on a recommended item."""
        self.db.add(feedback)
        await self.db.flush()
        return feedback

    async def get_feedback_by_user(self, user_id: str, limit: int = 50) -> List[RecommendationFeedback]:
        """Fetches historical recommendation feedback for a learner."""
        stmt = (
            select(RecommendationFeedback)
            .options(selectinload(RecommendationFeedback.resource))
            .where(RecommendationFeedback.user_id == user_id)
            .order_by(RecommendationFeedback.created_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_stats(self) -> Dict[str, Any]:
        """Aggregates engine performance and observability metrics."""
        total_runs_stmt = select(func.count(RecommendationLog.id))
        total_runs_res = await self.db.execute(total_runs_stmt)
        total_runs = total_runs_res.scalar() or 0

        avg_latency_stmt = select(func.avg(RecommendationLog.latency_ms))
        avg_latency_res = await self.db.execute(avg_latency_stmt)
        avg_latency = float(avg_latency_res.scalar() or 0.0)

        avg_diversity_stmt = select(func.avg(RecommendationLog.intra_list_diversity))
        avg_diversity_res = await self.db.execute(avg_diversity_stmt)
        avg_diversity = float(avg_diversity_res.scalar() or 0.0)

        feedback_count_stmt = select(func.count(RecommendationFeedback.id))
        feedback_count_res = await self.db.execute(feedback_count_stmt)
        feedback_count = feedback_count_res.scalar() or 0

        return {
            "total_recommendation_runs": total_runs,
            "avg_latency_ms": round(avg_latency, 2),
            "avg_intra_list_diversity": round(avg_diversity, 4),
            "total_feedbacks_recorded": feedback_count,
            "algorithm_version": "hybrid-v2.0"
        }
