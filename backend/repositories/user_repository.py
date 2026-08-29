from datetime import datetime, timezone
from typing import Optional, Dict, Any
from database.mongodb import get_database

class UserRepository:
    def __init__(self):
        self.collection_name = "users"

    @property
    def collection(self):
        return get_database()[self.collection_name]

    async def get_by_firebase_uid(self, firebase_uid: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"firebase_uid": firebase_uid})

    async def find_or_create_user(
        self,
        firebase_uid: str,
        email: Optional[str] = None,
        display_name: Optional[str] = None,
        profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        existing = await self.get_by_firebase_uid(firebase_uid)
        now = datetime.now(timezone.utc)

        if existing:
            update_fields: Dict[str, Any] = {"updated_at": now}
            if email and existing.get("email") != email:
                update_fields["email"] = email
            if display_name and existing.get("display_name") != display_name:
                update_fields["display_name"] = display_name
            if profile:
                update_fields["profile"] = {**existing.get("profile", {}), **profile}

            await self.collection.update_one(
                {"firebase_uid": firebase_uid},
                {"$set": update_fields}
            )
            return await self.get_by_firebase_uid(firebase_uid)

        default_profile = {
            "goals": [],
            "interests": [],
            "current_skills": {},
            "skill_level": "beginner",
            "preferences": {
                "learning_pace": "moderate",
                "format": "interactive"
            }
        }
        if profile:
            default_profile.update(profile)

        user_doc = {
            "firebase_uid": firebase_uid,
            "email": email or f"{firebase_uid}@example.com",
            "display_name": display_name or "Learner",
            "created_at": now,
            "updated_at": now,
            "profile": default_profile
        }

        await self.collection.insert_one(user_doc)
        return user_doc

user_repository = UserRepository()
