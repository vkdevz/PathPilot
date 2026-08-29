import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Union
from database.mongodb import get_database

logger = logging.getLogger("pathpilot.session")

class SessionRepository:
    def __init__(self):
        self.collection_name = "sessions"

    @property
    def collection(self):
        return get_database()[self.collection_name]

    def _get_id_variants(self, session_id: str) -> List[str]:
        variants = [session_id]
        if session_id.startswith("session_"):
            clean_id = session_id[8:]
            variants.extend([f"sess_{clean_id}", clean_id])
        elif session_id.startswith("sess_"):
            clean_id = session_id[5:]
            variants.extend([f"session_{clean_id}", clean_id])
        else:
            variants.extend([f"session_{session_id}", f"sess_{session_id}"])
        return list(dict.fromkeys(variants))

    async def create_session(
        self,
        session_id_or_learner_id: str,
        firebase_uid: Optional[str] = None,
        learner_profile: Optional[Dict[str, Any]] = None,
        learner_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a new session document in MongoDB.
        Flexible signature supporting both:
          create_session(session_id, firebase_uid, learner_profile)
          create_session(learner_id)
        """
        now = datetime.now(timezone.utc)
        
        # Resolve session_id and learner_id/firebase_uid
        if firebase_uid is None and learner_id is None:
            # Called as create_session(learner_id)
            eff_learner_id = session_id_or_learner_id
            eff_session_id = f"session_{uuid.uuid4().hex[:12]}"
        else:
            eff_session_id = session_id_or_learner_id
            eff_learner_id = learner_id or firebase_uid or "dev-user-123"

        session_doc = {
            "session_id": eff_session_id,
            "learner_id": eff_learner_id,
            "firebase_uid": eff_learner_id,
            "selected_career": None,
            "assessment": None,
            "assessment_id": None,
            "assessment_result": None,
            "skill_gaps": None,
            "learning_path": [],
            "learner_profile": learner_profile or {},
            "agent_trace": [],
            "status": "active",
            "created_at": now,
            "updated_at": now
        }
        await self.collection.insert_one(session_doc)
        session_doc.pop("_id", None)
        return session_doc

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a session document from MongoDB by session_id.
        """
        variants = self._get_id_variants(session_id)
        logger.info(f"SESSION LOOKUP\nsession_id={session_id}\ndatabase=path_pilot\ncollection=sessions")
        doc = await self.collection.find_one({"session_id": {"$in": variants}}, {"_id": 0})
        if doc:
            logger.info(f"SESSION FOUND\nsession_id={session_id}")
            # Ensure both keys exist
            if "learner_id" not in doc and "firebase_uid" in doc:
                doc["learner_id"] = doc["firebase_uid"]
            if "firebase_uid" not in doc and "learner_id" in doc:
                doc["firebase_uid"] = doc["learner_id"]
        else:
            logger.info(f"SESSION NOT FOUND\nsession_id={session_id}")
        return doc

    async def get_active_session_by_learner(self, learner_id: str) -> Optional[Dict[str, Any]]:
        """
        Find an existing active session for a given Firebase UID / learner_id.
        """
        doc = await self.collection.find_one(
            {
                "$or": [{"learner_id": learner_id}, {"firebase_uid": learner_id}],
                "status": {"$ne": "archived"}
            },
            {"_id": 0},
            sort=[("updated_at", -1)]
        )
        if doc:
            if "learner_id" not in doc and "firebase_uid" in doc:
                doc["learner_id"] = doc["firebase_uid"]
            if "firebase_uid" not in doc and "learner_id" in doc:
                doc["firebase_uid"] = doc["learner_id"]
        return doc

    async def get_or_create_session(
        self,
        learner_id: str,
        learner_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Look for an existing active session for learner_id; if found return it,
        otherwise create and persist a new session.
        """
        existing = await self.get_active_session_by_learner(learner_id)
        if existing:
            return existing
        return await self.create_session(
            session_id_or_learner_id=f"session_{uuid.uuid4().hex[:12]}",
            firebase_uid=learner_id,
            learner_profile=learner_profile
        )

    async def save_session(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save or upsert a full session document to MongoDB.
        """
        session_id = session.get("session_id")
        if not session_id:
            raise ValueError("session must contain a session_id")

        now = datetime.now(timezone.utc)
        session["updated_at"] = now
        if "created_at" not in session:
            session["created_at"] = now

        # Ensure consistency of learner identifier
        if "learner_id" in session and "firebase_uid" not in session:
            session["firebase_uid"] = session["learner_id"]
        elif "firebase_uid" in session and "learner_id" not in session:
            session["learner_id"] = session["firebase_uid"]

        variants = self._get_id_variants(session_id)
        await self.collection.update_one(
            {"session_id": {"$in": variants}},
            {"$set": session},
            upsert=True
        )
        return await self.get_session(session_id)

    async def update_session(self, session_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update specific fields of a session document.
        """
        now = datetime.now(timezone.utc)
        update_data["updated_at"] = now

        variants = self._get_id_variants(session_id)
        await self.collection.update_one(
            {"session_id": {"$in": variants}},
            {"$set": update_data}
        )
        return await self.get_session(session_id)

    async def delete_session(self, session_id: str) -> bool:
        variants = self._get_id_variants(session_id)
        res = await self.collection.delete_one({"session_id": {"$in": variants}})
        return res.deleted_count > 0

session_repository = SessionRepository()
