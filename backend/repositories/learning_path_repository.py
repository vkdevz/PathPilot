from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from database.mongodb import get_database

class LearningPathRepository:
    def __init__(self):
        self.collection_name = "learning_paths"

    @property
    def collection(self):
        return get_database()[self.collection_name]

    async def upsert_learning_path(
        self,
        firebase_uid: str,
        session_id: str,
        career_id: str,
        milestones: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        existing = await self.collection.find_one({"session_id": session_id})
        created_at = existing.get("created_at") if existing else now

        doc = {
            "firebase_uid": firebase_uid,
            "session_id": session_id,
            "career_id": career_id,
            "milestones": milestones,
            "created_at": created_at,
            "updated_at": now
        }
        await self.collection.update_one(
            {"session_id": session_id},
            {"$set": doc},
            upsert=True
        )
        return doc

    async def get_by_session_id(self, session_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"session_id": session_id}, {"_id": 0})

learning_path_repository = LearningPathRepository()
