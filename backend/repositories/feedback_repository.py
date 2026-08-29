from datetime import datetime, timezone
from typing import List, Dict, Any
from database.mongodb import get_database

class FeedbackRepository:
    def __init__(self):
        self.collection_name = "feedback"

    @property
    def collection(self):
        return get_database()[self.collection_name]

    async def record_feedback(
        self,
        firebase_uid: str,
        session_id: str,
        milestone_order: int,
        feedback_type: str
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {
            "firebase_uid": firebase_uid,
            "session_id": session_id,
            "milestone_order": milestone_order,
            "feedback_type": feedback_type,
            "created_at": now
        }
        await self.collection.insert_one(doc)
        doc.pop("_id", None)
        return doc

    async def get_session_feedback(self, session_id: str) -> List[Dict[str, Any]]:
        cursor = self.collection.find({"session_id": session_id}, {"_id": 0})
        return await cursor.to_list(length=100)

feedback_repository = FeedbackRepository()
