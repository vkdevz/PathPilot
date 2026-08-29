from datetime import datetime, timezone
from typing import Optional, Dict, Any
from database.mongodb import get_database

class SkillRepository:
    def __init__(self):
        self.collection_name = "skill_profiles"

    @property
    def collection(self):
        return get_database()[self.collection_name]

    async def upsert_skill_profile(
        self,
        firebase_uid: str,
        session_id: str,
        career_id: str,
        skills: Dict[str, Any],
        overall_score: float
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {
            "firebase_uid": firebase_uid,
            "session_id": session_id,
            "career_id": career_id,
            "skills": skills,
            "overall_score": overall_score,
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

    async def get_latest_user_profile(self, firebase_uid: str) -> Optional[Dict[str, Any]]:
        cursor = self.collection.find({"firebase_uid": firebase_uid}, {"_id": 0}).sort("updated_at", -1).limit(1)
        profiles = await cursor.to_list(length=1)
        return profiles[0] if profiles else None

skill_repository = SkillRepository()
