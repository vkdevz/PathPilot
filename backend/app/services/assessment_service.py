from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.career_repository import CareerRepository
from app.repositories.skill_repository import SkillRepository
from app.repositories.user_repository import UserRepository
from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.resource_repository import ResourceRepository
from app.models.assessment import Assessment, Question, AssessmentAttempt
from app.models.learning_path import LearningPath, LearningPathItem
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

        # 2. Grade answers
        topic_totals: Dict[str, Dict[str, Any]] = {}
        total_correct = 0
        total_questions = len(answers)
        graded_submissions = []

        for ans in answers:
            q = q_map.get(ans.question_id)
            if not q:
                continue
            is_correct = (ans.selected_option == q.correct_answer_index)
            if is_correct:
                total_correct += 1

            skill_id = q.skill_id
            skill_name = q.skill.name if q.skill else "Skill"
            if skill_id not in topic_totals:
                topic_totals[skill_id] = {"name": skill_name, "count": 0, "correct": 0}
            topic_totals[skill_id]["count"] += 1
            if is_correct:
                topic_totals[skill_id]["correct"] += 1

            graded_submissions.append({
                "question_id": q.id,
                "skill_id": skill_id,
                "selected_option": ans.selected_option,
                "is_correct": is_correct
            })

        overall_score = round((total_correct / max(total_questions, 1)) * 100, 1)

        # 3. Classify topics
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

            # Update LearnerSkill record in DB
            await self.skill_repo.upsert_learner_skill(
                user_id=user_id,
                skill_id=skill_id,
                score=score_pct,
                status=status
            )

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
            # Delete old items explicitly via query to avoid async lazyload issues
            await self.db.execute(
                delete(LearningPathItem).where(LearningPathItem.learning_path_id == active_path.id)
            )

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

        # Award 100 XP & set target career in profile
        await self.user_repo.add_xp(user_id, 100)
        await self.user_repo.update_profile(user_id, {"target_career_id": career.id})
        await self.db.flush()

        return {
            "attempt_id": attempt.id,
            "overall_score": overall_score,
            "strong_topics": strong_topics,
            "moderate_topics": moderate_topics,
            "weak_topics": weak_topics,
            "topic_scores": topic_scores,
            "completed_at": now
        }
