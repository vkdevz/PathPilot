import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.skill import Skill, LearnerSkill
from app.models.adaptive import (
    LearnerEvidence,
    LearnerStateHistory,
    AdaptationEvent,
    RoadmapVersion,
)
from app.models.learning_path import LearningPath
from app.repositories.skill_repository import SkillRepository
from app.repositories.user_repository import UserRepository
from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.progress_repository import ProgressRepository

from app.services.adaptive.config import ALGORITHM_VERSION
from app.services.adaptive.evidence_service import EvidenceService
from app.services.adaptive.proficiency_engine import ProficiencyEngine
from app.services.adaptive.mastery_struggle_detector import MasteryStruggleDetector
from app.services.adaptive.pace_estimator import PaceEstimator
from app.services.adaptive.roadmap_adapter import RoadmapAdapter
from app.services.skill_gap.gap_engine import SkillGapEngine
from app.services.skill_graph.graph_service import SkillGraphService

logger = logging.getLogger("pathpilot.adaptive.service")

class AdaptiveLearningService:
    """
    Main Orchestrator for PathPilot 2.0 Adaptive Learning Engine.
    Executes the deterministic evidence-to-roadmap closed loop.
    """
    def __init__(self, db: AsyncSession):
        self.db = db
        self.evidence_service = EvidenceService(db)
        self.roadmap_adapter = RoadmapAdapter(db)
        self.skill_repo = SkillRepository(db)
        self.user_repo = UserRepository(db)
        self.learning_path_repo = LearningPathRepository(db)
        self.progress_repo = ProgressRepository(db)
        self.gap_engine = SkillGapEngine(db)
        self.graph_service = SkillGraphService(db)

    async def ingest_evidence_and_adapt(
        self,
        user_id: str,
        skill_id: str,
        evidence_type: str,
        score: float,
        raw_score: Optional[float] = None,
        source_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Full Closed Loop:
        Evidence -> State Update -> Gap Recalculation -> Roadmap Adaptation -> Event Logging
        """
        # 1. Ingest and deduplicate evidence
        evidence, is_new = await self.evidence_service.record_evidence(
            user_id=user_id,
            skill_id=skill_id,
            evidence_type=evidence_type,
            score=score,
            raw_score=raw_score,
            source_id=source_id,
            metadata=metadata
        )

        if not is_new:
            logger.info(f"Evidence {evidence.id} already processed. Idempotent return.")
            return {
                "status": "duplicate_skipped",
                "evidence_id": evidence.id,
                "message": "Duplicate evidence detected; state remained unchanged."
            }

        # 2. Fetch current learner skill state
        skill_record = await self.skill_repo.get_learner_skill(user_id, skill_id)
        current_prof = skill_record.proficiency if skill_record else 0.0
        current_conf = skill_record.confidence if skill_record else 0.40

        # 3. Compute deterministic proficiency update
        update_result = ProficiencyEngine.compute_update(
            current_proficiency=current_prof,
            current_confidence=current_conf,
            evidence=evidence
        )
        new_prof = update_result["new_proficiency"]
        new_conf = update_result["new_confidence"]

        # 4. Fetch evidence history for this skill
        history = await self.evidence_service.get_evidence_for_skill(user_id, skill_id)

        # 5. Classify mastery & evaluate struggle
        mastery_state = MasteryStruggleDetector.classify_mastery(new_prof, new_conf)
        struggle_eval = MasteryStruggleDetector.evaluate_struggle(history, new_prof)

        # 6. Estimate learning pace
        user_study_logs = await self.progress_repo.get_user_progress(user_id, limit=30)
        active_path = await self.learning_path_repo.get_active_by_user(user_id)
        completed_items = [it for it in active_path.items if it.status == "completed"] if active_path else []
        pace_eval = PaceEstimator.estimate_pace(completed_items, user_study_logs)

        # 7. Update LearnerSkill in PostgreSQL
        skill_status = "mastered" if mastery_state == "MASTERED" else ("in_progress" if new_prof >= 0.20 else "available")
        await self.skill_repo.upsert_learner_skill(
            user_id=user_id,
            skill_id=skill_id,
            score=round(new_prof * 100.0, 1),
            status=skill_status,
            proficiency=new_prof,
            confidence=new_conf,
            evidence_source=evidence_type.lower()
        )

        # 8. Record LearnerStateHistory snapshot
        state_history = LearnerStateHistory(
            user_id=user_id,
            skill_id=skill_id,
            proficiency=new_prof,
            confidence=new_conf,
            mastery_state=mastery_state,
            struggle_state=struggle_eval["struggle_state"],
            learning_pace=pace_eval["pace"],
            algorithm_version=ALGORITHM_VERSION,
            trigger_event=f"{evidence_type}:{evidence.id}",
            metadata_json=update_result
        )
        self.db.add(state_history)

        # 9. Log Skill Updated Event
        skill_obj = await self.db.get(Skill, skill_id)
        skill_name = skill_obj.name if skill_obj else "Skill"
        
        adaptation_events = []
        if abs(update_result["proficiency_delta"]) >= 0.03:
            skill_event = AdaptationEvent(
                user_id=user_id,
                skill_id=skill_id,
                event_type="SKILL_UPDATED",
                trigger=f"Evidence:{evidence_type}",
                previous_state={"proficiency": current_prof, "confidence": current_conf},
                new_state={"proficiency": new_prof, "confidence": new_conf, "mastery_state": mastery_state},
                reason=f"Proficiency in '{skill_name}' updated from {current_prof*100:.0f}% to {new_prof*100:.0f}% following verified {evidence_type.lower()} (score: {evidence.score*100:.0f}%).",
                algorithm_version=ALGORITHM_VERSION
            )
            self.db.add(skill_event)
            adaptation_events.append(skill_event)

        # 10. Check for Roadmap Adaptations (Struggle, Mastery, or Pace)
        roadmap_adapted = False
        if struggle_eval["is_struggling"]:
            await self.graph_service.initialize()
            prereq_skills = self.graph_service.get_direct_prerequisites(skill_id)
            struggle_res = await self.roadmap_adapter.adapt_for_struggle(
                user_id=user_id,
                skill_id=skill_id,
                struggle_info=struggle_eval,
                prerequisite_skills=prereq_skills
            )
            if struggle_res:
                roadmap_adapted = True
                adaptation_events.append(struggle_res[0])
        elif mastery_state == "MASTERED":
            mastery_res = await self.roadmap_adapter.adapt_for_mastery(
                user_id=user_id,
                skill_id=skill_id,
                proficiency=new_prof,
                confidence=new_conf
            )
            if mastery_res:
                roadmap_adapted = True
                adaptation_events.append(mastery_res[0])
        
        # Check pace adaptation
        if pace_eval.get("pace") in ("FAST", "SLOW"):
            pace_res = await self.roadmap_adapter.adapt_for_pace(
                user_id=user_id,
                pace_info=pace_eval
            )
            if pace_res:
                roadmap_adapted = True
                adaptation_events.append(pace_res[0])

        await self.db.flush()


        # 11. Run Phase 7 Skill Gap Engine to detect Next Best Skill change
        gap_analysis = await self.gap_engine.analyze_learner_gaps(user_id)
        next_best_dict = {
            "skill_name": gap_analysis.next_best_skill.skill_name,
            "is_bottleneck": gap_analysis.next_best_skill.is_bottleneck,
            "readiness_state": gap_analysis.next_best_skill.readiness_state,
            "reason": gap_analysis.next_best_skill.reason
        } if gap_analysis.next_best_skill else None

        return {
            "status": "success",
            "evidence_id": evidence.id,
            "skill_id": skill_id,
            "skill_name": skill_name,
            "previous_proficiency": current_prof,
            "new_proficiency": new_prof,
            "proficiency_delta": update_result["proficiency_delta"],
            "confidence": new_conf,
            "mastery_state": mastery_state,
            "struggle_state": struggle_eval["struggle_state"],
            "learning_pace": pace_eval["pace"],
            "roadmap_adapted": roadmap_adapted,
            "next_best_skill": next_best_dict,
            "adaptation_events": [
                {
                    "id": ev.id,
                    "event_type": ev.event_type,
                    "reason": ev.reason,
                    "trigger": ev.trigger
                }
                for ev in adaptation_events
            ]
        }

    async def get_learner_adaptive_state(self, user_id: str) -> Dict[str, Any]:
        """
        Retrieves the complete adaptive state profile for the authenticated learner.
        """
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            return {"error": "User not found"}

        # Skills & proficiencies
        skills = await self.skill_repo.get_learner_skills(user_id)
        skills_summary = []
        for sk in skills:
            mastery = MasteryStruggleDetector.classify_mastery(sk.proficiency, sk.confidence)
            skills_summary.append({
                "skill_id": sk.skill_id,
                "skill_name": sk.skill.name if sk.skill else "Skill",
                "category": sk.skill.category if sk.skill else "Core",
                "proficiency": sk.proficiency,
                "score_pct": sk.score,
                "confidence": sk.confidence,
                "mastery_state": mastery,
                "evidence_source": sk.evidence_source,
                "status": sk.status
            })

        # Pacing
        user_study_logs = await self.progress_repo.get_user_progress(user_id, limit=30)
        active_path = await self.learning_path_repo.get_active_by_user(user_id)
        completed_items = [it for it in active_path.items if it.status == "completed"] if active_path else []
        pace_info = PaceEstimator.estimate_pace(completed_items, user_study_logs)

        # Gap analysis
        gap_analysis = await self.gap_engine.analyze_learner_gaps(user_id)

        # Recent adaptations
        query = (
            select(AdaptationEvent)
            .where(AdaptationEvent.user_id == user_id)
            .order_by(AdaptationEvent.created_at.desc())
            .limit(5)
        )
        res = await self.db.execute(query)
        recent_events = res.scalars().all()

        next_best_dict = {
            "skill_name": gap_analysis.next_best_skill.skill_name,
            "is_bottleneck": gap_analysis.next_best_skill.is_bottleneck,
            "readiness_state": gap_analysis.next_best_skill.readiness_state,
            "reason": gap_analysis.next_best_skill.reason
        } if gap_analysis.next_best_skill else None

        bottlenecks_list = [
            {
                "skill_id": b.skill_id,
                "skill_name": b.skill_name,
                "downstream_impact_score": b.downstream_impact_score,
                "downstream_skills_count": b.downstream_skills_count
            }
            for b in gap_analysis.bottlenecks
        ]

        return {
            "user_id": user_id,
            "display_name": user.display_name,
            "target_career": gap_analysis.career_name if gap_analysis else "Data Scientist",
            "career_readiness_pct": gap_analysis.career_readiness_score if gap_analysis else 0.0,
            "estimated_learning_pace": pace_info["pace"],
            "pace_velocity_ratio": pace_info["velocity_ratio"],
            "skills": skills_summary,
            "next_best_skill": next_best_dict,
            "bottleneck_skills": bottlenecks_list,
            "recent_adaptations": [
                {
                    "id": ev.id,
                    "event_type": ev.event_type,
                    "reason": ev.reason,
                    "trigger": ev.trigger,
                    "created_at": ev.created_at.isoformat() if ev.created_at else None
                }
                for ev in recent_events
            ]
        }

    async def get_adaptation_timeline(self, user_id: str, limit: int = 25) -> List[Dict[str, Any]]:
        """
        Chronological timeline of all adaptation events for explainability.
        """
        query = (
            select(AdaptationEvent)
            .where(AdaptationEvent.user_id == user_id)
            .order_by(AdaptationEvent.created_at.desc())
            .limit(limit)
        )
        res = await self.db.execute(query)
        events = res.scalars().all()

        timeline = []
        for ev in events:
            timeline.append({
                "id": ev.id,
                "event_type": ev.event_type,
                "trigger": ev.trigger,
                "reason": ev.reason,
                "previous_state": ev.previous_state,
                "new_state": ev.new_state,
                "algorithm_version": ev.algorithm_version,
                "created_at": ev.created_at.isoformat() if ev.created_at else None
            })
        return timeline

    async def get_progress_history(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Returns chronological skill progress data points over time for visualization.
        """
        query = (
            select(LearnerStateHistory)
            .where(LearnerStateHistory.user_id == user_id)
            .order_by(LearnerStateHistory.created_at.asc())
        )
        res = await self.db.execute(query)
        histories = res.scalars().all()

        return [
            {
                "id": h.id,
                "skill_id": h.skill_id,
                "skill_name": h.skill.name if h.skill else "Skill",
                "proficiency": h.proficiency,
                "score_pct": round(h.proficiency * 100.0, 1),
                "confidence": h.confidence,
                "mastery_state": h.mastery_state,
                "struggle_state": h.struggle_state,
                "trigger_event": h.trigger_event,
                "created_at": h.created_at.isoformat() if h.created_at else None
            }
            for h in histories
        ]

    async def get_roadmap_versions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Returns all historical and current roadmap versions for diffing and traceability.
        """
        query = (
            select(RoadmapVersion)
            .where(RoadmapVersion.user_id == user_id)
            .order_by(RoadmapVersion.version_number.desc())
        )
        res = await self.db.execute(query)
        versions = res.scalars().all()

        return [
            {
                "id": v.id,
                "version_number": v.version_number,
                "learning_path_id": v.learning_path_id,
                "reason": v.reason,
                "milestones_count": len(v.milestones_snapshot),
                "milestones": v.milestones_snapshot,
                "is_active": v.is_active,
                "created_at": v.created_at.isoformat() if v.created_at else None
            }
            for v in versions
        ]
