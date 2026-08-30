from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, desc
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.career_repository import CareerRepository
from app.repositories.skill_repository import SkillRepository
from app.repositories.user_repository import UserRepository
from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.resource_repository import ResourceRepository
from app.models.assessment import Assessment, Question, AssessmentAttempt
from app.models.learning_path import LearningPath, LearningPathItem
from app.models.adaptive import RoadmapVersion, LearnerStateHistory
from app.schemas.assessment import SingleAnswerSubmission

STRONG_THRESHOLD = 80.0
MODERATE_THRESHOLD = 50.0

class AssessmentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.assessment_repo = AssessmentRepository(db)
        self.career_repo = CareerRepository(db)
        self.skill_repo = SkillRepository(db)
        self.user_repo = UserRepository(db)
        self.learning_path_repo = LearningPathRepository(db)
        self.resource_repo = ResourceRepository(db)

    async def get_assessment_for_career(self, career_slug: str) -> Optional[Assessment]:
        career = await self.career_repo.get_by_slug(career_slug)
        if not career:
            return None
        return await self.assessment_repo.get_by_career_id(career.id)

    async def evaluate_and_submit(
        self,
        user_id: str,
        career_slug: Optional[str],
        answers: List[SingleAnswerSubmission]
    ) -> Dict[str, Any]:
        # 1. Resolve target career
        career = None
        if career_slug:
            career = await self.career_repo.get_by_slug(career_slug)
        if not career:
            user = await self.user_repo.get_by_id(user_id)
            if user and user.profile and user.profile.target_career_id:
                career = await self.career_repo.get_by_id(user.profile.target_career_id)
        if not career:
            careers = await self.career_repo.get_all()
            career = careers[0] if careers else None

        if not career:
            raise ValueError("No career track found to evaluate assessment.")

        assessment = await self.assessment_repo.get_by_career_id(career.id)
        questions = assessment.questions if assessment else []
        q_map: Dict[str, Question] = {q.id: q for q in questions}

        # Build submitted answer map by question_id
        answer_map: Dict[str, int] = {ans.question_id: ans.selected_option for ans in answers}

        # 2. Grade across ALL assessment questions (handles skipped / partial answers accurately)
        topic_totals: Dict[str, Dict[str, Any]] = {}
        total_correct = 0
        graded_submissions = []

        total_assessment_questions = len(questions) if questions else len(answers)

        for q in questions:
            selected = answer_map.get(q.id, -1)
            is_correct = (selected == q.correct_answer_index and selected != -1)
            if is_correct:
                total_correct += 1

            skill_id = q.skill_id
            skill_name = q.skill.name if q.skill else "Core Competency"
            if skill_id not in topic_totals:
                topic_totals[skill_id] = {"name": skill_name, "count": 0, "correct": 0}
            topic_totals[skill_id]["count"] += 1
            if is_correct:
                topic_totals[skill_id]["correct"] += 1

            graded_submissions.append({
                "question_id": q.id,
                "skill_id": skill_id,
                "selected_option": selected,
                "is_correct": is_correct
            })

        # If questions list was empty, fallback to grading whatever answers were provided
        if not questions and answers:
            for ans in answers:
                graded_submissions.append({
                    "question_id": ans.question_id,
                    "skill_id": "core-skill",
                    "selected_option": ans.selected_option,
                    "is_correct": True
                })
            total_correct = len(answers)
            total_assessment_questions = len(answers)

        overall_score = round((total_correct / max(total_assessment_questions, 1)) * 100, 1)

        # 3. Classify topics & calculate position ranking
        topic_scores = []
        strong_topics = []
        moderate_topics = []
        weak_topics = []

        for skill_id, info in topic_totals.items():
            correct = info["correct"]
            total = info["count"]
            score_pct = round((correct / max(total, 1)) * 100, 1)

            if score_pct >= STRONG_THRESHOLD:
                level = "Strong"
                status = "mastered"
                strong_topics.append({"skill_id": skill_id, "name": info["name"], "score": score_pct})
            elif score_pct >= MODERATE_THRESHOLD:
                level = "Moderate"
                status = "in_progress"
                moderate_topics.append({"skill_id": skill_id, "name": info["name"], "score": score_pct})
            else:
                level = "Weak"
                status = "available"
                weak_topics.append({"skill_id": skill_id, "name": info["name"], "score": score_pct})

            topic_scores.append({
                "skill_id": skill_id,
                "skill_name": info["name"],
                "score": score_pct,
                "strength_level": level,
                "correct_count": correct,
                "total_count": total
            })

            # Ingest evidence into Adaptive Learning Engine
            from app.services.adaptive.evidence_service import EvidenceService
            from app.services.adaptive.mastery_struggle_detector import MasteryStruggleDetector
            from app.services.adaptive.config import ALGORITHM_VERSION

            evidence_svc = EvidenceService(self.db)
            await evidence_svc.record_evidence(
                user_id=user_id,
                skill_id=skill_id,
                evidence_type="ASSESSMENT",
                score=score_pct / 100.0,
                raw_score=score_pct,
                source_id=f"assessment_{career.id}",
                metadata={"correct": correct, "total": total}
            )

            # Update LearnerSkill record with normalized proficiency & confidence
            prof_norm = score_pct / 100.0
            conf_norm = 0.90
            await self.skill_repo.upsert_learner_skill(
                user_id=user_id,
                skill_id=skill_id,
                score=score_pct,
                status=status,
                proficiency=prof_norm,
                confidence=conf_norm,
                evidence_source="assessment"
            )

            # Persist state history snapshot
            state_hist = LearnerStateHistory(
                user_id=user_id,
                skill_id=skill_id,
                proficiency=prof_norm,
                confidence=conf_norm,
                mastery_state=MasteryStruggleDetector.classify_mastery(prof_norm, conf_norm),
                struggle_state="NORMAL",
                learning_pace="NORMAL",
                algorithm_version=ALGORITHM_VERSION,
                trigger_event=f"AssessmentSubmission:{career.slug}",
                metadata_json={"score_pct": score_pct}
            )
            self.db.add(state_hist)

        # Calculate Position Ranking & Percentile
        if overall_score >= 90.0:
            percentile_rank = 95.0
            position_rank = "Top 5% — Advanced Readiness"
        elif overall_score >= 80.0:
            percentile_rank = 85.0
            position_rank = "Top 15% — Target Ready"
        elif overall_score >= 65.0:
            percentile_rank = 65.0
            position_rank = "Top 35% — Developing Contender"
        elif overall_score >= 50.0:
            percentile_rank = 45.0
            position_rank = "Top 55% — Foundation Intermediate"
        elif overall_score > 0.0:
            percentile_rank = 25.0
            position_rank = "Baseline Entry Track"
        else:
            percentile_rank = 10.0
            position_rank = "Introductory Foundation"

        now = datetime.now(timezone.utc)

        # 4. Record AssessmentAttempt
        attempt = AssessmentAttempt(
            user_id=user_id,
            assessment_id=assessment.id if assessment else career.id,
            overall_score=overall_score,
            topic_breakdown=topic_scores,
            submitted_answers=graded_submissions,
            completed_at=now
        )
        await self.assessment_repo.create_attempt(attempt)

        # 5. Generate & Persist Personalized Learning Path
        career_skills = sorted(career.career_skills, key=lambda cs: cs.recommended_order)
        skill_score_map = {t["skill_id"]: t["score"] for t in topic_scores}

        # Check existing active learning path
        active_path = await self.learning_path_repo.get_active_by_user(user_id)
        if not active_path:
            active_path = LearningPath(
                user_id=user_id,
                career_id=career.id,
                status="active"
            )
            await self.learning_path_repo.create(active_path)
        else:
            active_path.career_id = career.id
            await self.db.execute(
                delete(LearningPathItem).where(LearningPathItem.learning_path_id == active_path.id)
            )

        recommendations = []
        for idx, cs in enumerate(career_skills, start=1):
            sk = cs.skill
            score = skill_score_map.get(sk.id, 0.0)

            # Reasoning
            if score > 0 and score < 50.0:
                reason = f"Diagnostic Quiz Score: {score:.0f}% (High Priority Skill Gap)."
                item_status = "available" if idx == 1 else "locked"
            elif score >= 50.0 and score < 80.0:
                reason = f"Diagnostic Quiz Score: {score:.0f}% (Target Mastery needed for {career.name})."
                item_status = "available" if idx == 1 else "locked"
            elif score >= 80.0:
                reason = f"Mastered in Diagnostic Quiz ({score:.0f}%)."
                item_status = "completed"
            else:
                reason = f"Core milestone in recommended learning progression for {career.name}."
                item_status = "available" if idx == 1 else "locked"

            matching_resources = await self.resource_repo.get_by_skill_id(sk.id)
            resource_id = matching_resources[0].id if matching_resources else None

            item = LearningPathItem(
                learning_path_id=active_path.id,
                skill_id=sk.id,
                resource_id=resource_id,
                step_order=idx,
                status=item_status,
                recommendation_reason=reason,
                estimated_hours=max(1, round(sk.estimated_minutes / 60))
            )
            self.db.add(item)

            if matching_resources:
                recommendations.append({
                    "skill_name": sk.name,
                    "resource_title": matching_resources[0].title,
                    "resource_slug": matching_resources[0].slug,
                    "estimated_minutes": matching_resources[0].estimated_minutes,
                    "priority": "High" if score < 50 else ("Medium" if score < 80 else "Low")
                })

        # Record initial RoadmapVersion snapshot (v1)
        items_snapshot = [
            {
                "step_order": idx,
                "skill_slug": cs.skill.slug if cs.skill else "skill",
                "skill_name": cs.skill.name if cs.skill else "Skill",
                "category": cs.skill.category if cs.skill else "Core",
                "status": "available" if idx == 1 else "locked"
            }
            for idx, cs in enumerate(career_skills, start=1)
        ]
        init_version = RoadmapVersion(
            user_id=user_id,
            learning_path_id=active_path.id,
            version_number=1,
            reason=f"Initial calibration for {career.name} via Diagnostic Assessment ({overall_score}% score)",
            milestones_snapshot=items_snapshot
        )
        self.db.add(init_version)

        # Award 100 XP & set target career in profile
        await self.user_repo.add_xp(user_id, 100)
        await self.user_repo.update_profile(user_id, {"target_career_id": career.id})
        await self.db.flush()

        return {
            "attempt_id": attempt.id,
            "career_id": career.id,
            "career_slug": career.slug,
            "career_name": career.name,
            "overall_score": overall_score,
            "position_rank": position_rank,
            "percentile_rank": percentile_rank,
            "strong_topics": strong_topics,
            "moderate_topics": moderate_topics,
            "weak_topics": weak_topics,
            "topic_scores": topic_scores,
            "recommendations": recommendations[:3],
            "completed_at": now
        }

    async def get_latest_attempt(self, user_id: str, career_slug: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Retrieves the latest diagnostic assessment attempt for the learner.
        """
        attempts = await self.assessment_repo.get_attempts_by_user(user_id)
        if not attempts:
            return None

        # Filter by career if specified
        target_attempt = None
        if career_slug:
            career = await self.career_repo.get_by_slug(career_slug)
            if career:
                assessment = await self.assessment_repo.get_by_career_id(career.id)
                for a in attempts:
                    if assessment and a.assessment_id in (assessment.id, career.id):
                        target_attempt = a
                        break

        if not target_attempt:
            target_attempt = attempts[0]

        # Calculate position ranking
        score = target_attempt.overall_score
        if score >= 90.0:
            pct = 95.0
            pos = "Top 5% — Advanced Readiness"
        elif score >= 80.0:
            pct = 85.0
            pos = "Top 15% — Target Ready"
        elif score >= 65.0:
            pct = 65.0
            pos = "Top 35% — Developing Contender"
        elif score >= 50.0:
            pct = 45.0
            pos = "Top 55% — Foundation Intermediate"
        elif score > 0.0:
            pct = 25.0
            pos = "Baseline Entry Track"
        else:
            pct = 10.0
            pos = "Introductory Foundation"

        career_name = "Career Track"
        career_slug_val = None
        career_id_val = None
        if target_attempt.assessment and target_attempt.assessment.career:
            career_name = target_attempt.assessment.career.name
            career_slug_val = target_attempt.assessment.career.slug
            career_id_val = target_attempt.assessment.career.id

        strong = []
        moderate = []
        weak = []
        topic_scores = target_attempt.topic_breakdown or []
        for t in topic_scores:
            s_val = t.get("score", 0.0)
            if s_val >= STRONG_THRESHOLD:
                strong.append({"skill_id": t.get("skill_id"), "name": t.get("skill_name"), "score": s_val})
            elif s_val >= MODERATE_THRESHOLD:
                moderate.append({"skill_id": t.get("skill_id"), "name": t.get("skill_name"), "score": s_val})
            else:
                weak.append({"skill_id": t.get("skill_id"), "name": t.get("skill_name"), "score": s_val})

        return {
            "attempt_id": target_attempt.id,
            "career_id": career_id_val,
            "career_slug": career_slug_val,
            "career_name": career_name,
            "overall_score": score,
            "position_rank": pos,
            "percentile_rank": pct,
            "strong_topics": strong,
            "moderate_topics": moderate,
            "weak_topics": weak,
            "topic_scores": topic_scores,
            "completed_at": target_attempt.completed_at or target_attempt.created_at
        }
