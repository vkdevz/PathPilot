from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timezone
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.learning_path import LearningPath, LearningPathItem
from app.models.adaptive import AdaptationEvent, RoadmapVersion
from app.models.skill import Skill
from app.models.career import Career
from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.resource_repository import ResourceRepository
from app.repositories.skill_repository import SkillRepository
from app.services.adaptive.config import ALGORITHM_VERSION

logger = logging.getLogger("pathpilot.adaptive.roadmap")

class RoadmapAdapter:
    """
    Handles dynamic, versioned roadmap adaptations in response to learner evidence and state transitions.
    Never destructively overwrites progression without creating an auditable RoadmapVersion record.
    """
    def __init__(self, db: AsyncSession):
        self.db = db
        self.learning_path_repo = LearningPathRepository(db)
        self.resource_repo = ResourceRepository(db)
        self.skill_repo = SkillRepository(db)

    async def _serialize_milestones(self, items: List[LearningPathItem]) -> List[Dict[str, Any]]:
        snapshot = []
        skill_ids = [it.skill_id for it in items if it.skill_id]
        skill_map = {}
        if skill_ids:
            s_res = await self.db.execute(select(Skill).where(Skill.id.in_(skill_ids)))
            for s in s_res.scalars().all():
                skill_map[s.id] = s.name

        for item in sorted(items, key=lambda x: x.step_order):
            s_name = skill_map.get(item.skill_id, "Skill")
            snapshot.append({
                "id": item.id,
                "skill_id": item.skill_id,
                "skill_name": s_name,
                "step_order": item.step_order,
                "status": item.status,
                "recommendation_reason": item.recommendation_reason,
                "estimated_hours": item.estimated_hours,
                "resource_id": item.resource_id,
                "completed_at": item.completed_at.isoformat() if item.completed_at else None
            })
        return snapshot

    async def get_latest_version_number(self, learning_path_id: str) -> int:
        query = (
            select(RoadmapVersion.version_number)
            .where(RoadmapVersion.learning_path_id == learning_path_id)
            .order_by(RoadmapVersion.version_number.desc())
            .limit(1)
        )
        result = await self.db.execute(query)
        latest = result.scalar_one_or_none()
        return latest if latest is not None else 0

    async def adapt_for_struggle(
        self,
        user_id: str,
        skill_id: str,
        struggle_info: Dict[str, Any],
        prerequisite_skills: List[Skill]
    ) -> Optional[Tuple[AdaptationEvent, RoadmapVersion]]:
        """
        Dynamically adapts roadmap when a learner struggles with a skill.
        Inserts foundational reinforcement or prerequisite review without destroying progression.
        """
        active_path = await self.learning_path_repo.get_active_by_user(user_id)
        if not active_path:
            return None

        # Find target milestone
        target_item = next((item for item in active_path.items if item.skill_id == skill_id), None)
        if not target_item:
            return None

        skill = await self.db.get(Skill, skill_id)
        skill_name = skill.name if skill else "Core Skill"

        # Check if already adapted for struggle to avoid infinite insertion
        existing_reinforce = next(
            (item for item in active_path.items if f"Reinforcement:" in (item.recommendation_reason or "") and item.skill_id == skill_id),
            None
        )
        if existing_reinforce:
            logger.info(f"Reinforcement already present for skill {skill_id}. Skipping duplicate insertion.")
            return None

        previous_milestones = await self._serialize_milestones(active_path.items)

        # 1. Choose reinforcement resource
        matching_resources = await self.resource_repo.get_by_skill_id(skill_id)
        # Prefer beginner / practice resources
        practice_res = next((r for r in matching_resources if r.resource_type in ["practice", "lab", "article"]), None)
        if not practice_res and matching_resources:
            practice_res = matching_resources[0]

        # 2. Shift subsequent milestones order
        current_step = target_item.step_order
        for item in active_path.items:
            if item.step_order >= current_step:
                item.step_order += 1

        # 3. Insert reinforcement milestone
        reinforce_item = LearningPathItem(
            learning_path_id=active_path.id,
            skill_id=skill_id,
            resource_id=practice_res.id if practice_res else target_item.resource_id,
            step_order=current_step,
            status="available",
            recommendation_reason=f"Adaptive Reinforcement: Inserted targeted practice after detected struggle in {skill_name} ({struggle_info.get('reason')}).",
            estimated_hours=1
        )
        self.db.add(reinforce_item)
        target_item.status = "locked"  # Lock advanced until practice is done
        target_item.recommendation_reason = f"Pending completion of prerequisite reinforcement for {skill_name}."

        await self.db.flush()

        # 4. Create AdaptationEvent
        reason_text = (
            f"Detected persistent struggle in '{skill_name}' with {struggle_info.get('consecutive_failures', 2)} consecutive sub-passing scores. "
            f"Adapted roadmap by inserting prerequisite reinforcement milestone."
        )
        event = AdaptationEvent(
            user_id=user_id,
            skill_id=skill_id,
            event_type="ROADMAP_CHANGED",
            trigger=f"StruggleDetected:{skill_id}",
            previous_state={"milestone_count": len(previous_milestones), "active_step": current_step},
            new_state={"milestone_count": len(active_path.items) + 1, "inserted_reinforcement": skill_name},
            reason=reason_text,
            algorithm_version=ALGORITHM_VERSION
        )
        self.db.add(event)
        await self.db.flush()

        # 5. Create RoadmapVersion
        updated_milestones = await self._serialize_milestones(active_path.items + [reinforce_item])
        latest_ver = await self.get_latest_version_number(active_path.id)
        
        version = RoadmapVersion(
            user_id=user_id,
            learning_path_id=active_path.id,
            version_number=latest_ver + 1,
            adaptation_event_id=event.id,
            milestones_snapshot=updated_milestones,
            reason=reason_text,
            is_active=True
        )
        self.db.add(version)
        await self.db.flush()

        logger.info(f"Roadmap adapted for user={user_id}, skill={skill_name}. Version={version.version_number}")
        return event, version

    async def adapt_for_mastery(
        self,
        user_id: str,
        skill_id: str,
        proficiency: float,
        confidence: float
    ) -> Optional[Tuple[AdaptationEvent, RoadmapVersion]]:
        """
        Dynamically accelerates roadmap when learner masters a skill (unlocking downstream milestones).
        """
        active_path = await self.learning_path_repo.get_active_by_user(user_id)
        if not active_path:
            return None

        matching_item = next((item for item in active_path.items if item.skill_id == skill_id), None)
        if not matching_item:
            return None

        if matching_item.status == "completed":
            return None # Already completed

        skill = await self.db.get(Skill, skill_id)
        skill_name = skill.name if skill else "Skill"
        previous_milestones = await self._serialize_milestones(active_path.items)

        # Mark matching item completed
        matching_item.status = "completed"
        matching_item.completed_at = datetime.now(timezone.utc)
        matching_item.recommendation_reason = f"Mastery verified via adaptive assessment ({proficiency*100:.0f}% proficiency, {confidence*100:.0f}% confidence)."

        # Unlock next locked item
        next_item = next((item for item in sorted(active_path.items, key=lambda x: x.step_order) if item.step_order > matching_item.step_order and item.status != "completed"), None)
        unlocked_name = "Next Milestone"
        if next_item:
            next_item.status = "available"
            next_sk = await self.db.get(Skill, next_item.skill_id)
            unlocked_name = next_sk.name if next_sk else "Next Milestone"

        await self.db.flush()

        reason_text = (
            f"Demonstrated mastery in '{skill_name}' ({proficiency*100:.0f}% proficiency). "
            f"Accelerated roadmap and unlocked '{unlocked_name}'."
        )

        event = AdaptationEvent(
            user_id=user_id,
            skill_id=skill_id,
            event_type="MASTERY_DETECTED",
            trigger=f"MasteryDetected:{skill_id}",
            previous_state={"milestone_status": "in_progress", "proficiency": proficiency},
            new_state={"milestone_status": "completed", "unlocked_milestone": unlocked_name},
            reason=reason_text,
            algorithm_version=ALGORITHM_VERSION
        )
        self.db.add(event)
        await self.db.flush()

        updated_milestones = await self._serialize_milestones(active_path.items)
        latest_ver = await self.get_latest_version_number(active_path.id)

        version = RoadmapVersion(
            user_id=user_id,
            learning_path_id=active_path.id,
            version_number=latest_ver + 1,
            adaptation_event_id=event.id,
            milestones_snapshot=updated_milestones,
            reason=reason_text,
            is_active=True
        )
        self.db.add(version)
        await self.db.flush()

        return event, version

    async def adapt_for_pace(
        self,
        user_id: str,
        pace_info: Dict[str, Any]
    ) -> Optional[Tuple[AdaptationEvent, RoadmapVersion]]:
        """
        Dynamically adapts roadmap milestone duration and structure based on empirical learning pace.
        FAST: Compresses estimated hours and accelerates milestone cadence.
        SLOW: Reinforces estimated hours with dedicated milestone buffers.
        """
        pace = pace_info.get("pace")
        if pace not in ("FAST", "SLOW"):
            return None

        active_path = await self.learning_path_repo.get_active_by_user(user_id)
        if not active_path:
            return None

        # Check if already adapted for this pace to avoid redundant version creation
        latest_ver_num = await self.get_latest_version_number(active_path.id)
        q_recent = (
            select(AdaptationEvent)
            .where(AdaptationEvent.user_id == user_id, AdaptationEvent.event_type == "PACE_ADAPTED")
            .order_by(AdaptationEvent.created_at.desc())
            .limit(1)
        )
        recent_ev = (await self.db.execute(q_recent)).scalar_one_or_none()
        if recent_ev and recent_ev.new_state.get("pace") == pace:
            return None

        previous_milestones = await self._serialize_milestones(active_path.items)
        velocity_ratio = pace_info.get("velocity_ratio", 1.0)
        modified_count = 0

        if pace == "FAST":
            reason_text = (
                f"Your recent pace is faster than expected (velocity: {velocity_ratio}x benchmark). "
                f"Accelerated roadmap milestone cadence and optimized study schedule."
            )
            for item in active_path.items:
                if item.status in ("locked", "available"):
                    item.estimated_hours = max(1, round(item.estimated_hours * 0.75))
                    if "Accelerated" not in (item.recommendation_reason or ""):
                        item.recommendation_reason = f"{item.recommendation_reason or ''} (Accelerated pacing based on fast completion velocity)."
                    modified_count += 1
        else: # SLOW
            reason_text = (
                f"Your recent pace indicates a deliberate study cadence (velocity: {velocity_ratio}x). "
                f"Reinforced milestone pacing with dedicated review buffers to ensure thorough skill acquisition."
            )
            for item in active_path.items:
                if item.status in ("locked", "available"):
                    item.estimated_hours = round(item.estimated_hours * 1.3)
                    if "Reinforced" not in (item.recommendation_reason or ""):
                        item.recommendation_reason = f"{item.recommendation_reason or ''} (Reinforced pacing with dedicated mastery buffer)."
                    modified_count += 1

        if modified_count == 0:
            return None

        await self.db.flush()

        # Create AdaptationEvent
        event = AdaptationEvent(
            user_id=user_id,
            skill_id=active_path.items[0].skill_id if active_path.items else None,
            event_type="PACE_ADAPTED",
            trigger=f"PaceDetected:{pace}",
            previous_state={"pace": "NORMAL", "velocity_ratio": 1.0},
            new_state={"pace": pace, "velocity_ratio": velocity_ratio, "modified_milestones": modified_count},
            reason=reason_text,
            algorithm_version=ALGORITHM_VERSION
        )
        self.db.add(event)
        await self.db.flush()

        # Create RoadmapVersion
        updated_milestones = await self._serialize_milestones(active_path.items)
        version = RoadmapVersion(
            user_id=user_id,
            learning_path_id=active_path.id,
            version_number=latest_ver_num + 1,
            adaptation_event_id=event.id,
            milestones_snapshot=updated_milestones,
            reason=reason_text,
            is_active=True
        )
        self.db.add(version)
        await self.db.flush()

        logger.info(f"Pace adaptation applied for user={user_id}. Pace={pace}, Version={version.version_number}")
        return event, version

