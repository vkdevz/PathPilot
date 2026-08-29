from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from database.mongodb import get_database

class AssessmentRepository:
    @property
    def assessments_col(self):
        return get_database()["assessments"]

    @property
    def answers_col(self):
        return get_database()["assessment_answers"]

    async def create_assessment(
        self,
        assessment_id: str,
        session_id: str,
        firebase_uid: str,
        career_id: str,
        questions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {
            "assessment_id": assessment_id,
            "session_id": session_id,
            "firebase_uid": firebase_uid,
            "career_id": career_id,
            "created_at": now,
            "completed_at": None,
            "questions": questions,
            "status": "started"
        }
        await self.assessments_col.insert_one(doc)
        doc.pop("_id", None)
        return doc

    async def get_assessment(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        return await self.assessments_col.find_one({"assessment_id": assessment_id}, {"_id": 0})

    async def save_submitted_answers(
        self,
        assessment_id: str,
        session_id: str,
        firebase_uid: str,
        answers: List[Dict[str, Any]]
    ) -> None:
        now = datetime.now(timezone.utc)
        answer_docs = []
        for ans in answers:
            answer_docs.append({
                "assessment_id": assessment_id,
                "session_id": session_id,
                "firebase_uid": firebase_uid,
                "question_id": ans.get("question_id") or ans.get("id"),
                "skill": ans.get("skill_id", "general"),
                "answer": str(ans.get("selected_option")),
                "is_correct": ans.get("is_correct", False),
                "score": 1 if ans.get("is_correct") else 0,
                "submitted_at": now
            })
        if answer_docs:
            await self.answers_col.insert_many(answer_docs)

    async def complete_assessment(
        self,
        assessment_id: str,
        result_data: Dict[str, Any]
    ) -> None:
        now = datetime.now(timezone.utc)
        await self.assessments_col.update_one(
            {"assessment_id": assessment_id},
            {
                "$set": {
                    "completed_at": now,
                    "status": "completed",
                    "result": result_data
                }
            }
        )

assessment_repository = AssessmentRepository()
