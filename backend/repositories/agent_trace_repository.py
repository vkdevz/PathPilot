from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from database.mongodb import get_database

class AgentTraceRepository:
    def __init__(self):
        self.collection_name = "agent_traces"

    @property
    def collection(self):
        return get_database()[self.collection_name]

    async def add_trace_event(
        self,
        firebase_uid: str,
        session_id: str,
        agent: str,
        message: str
    ) -> None:
        now = datetime.now(timezone.utc)
        event = {
            "agent": agent,
            "message": message,
            "timestamp": now
        }
        await self.collection.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "firebase_uid": firebase_uid,
                    "updated_at": now
                },
                "$push": {"events": event}
            },
            upsert=True
        )

    async def get_trace(self, session_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"session_id": session_id}, {"_id": 0})

agent_trace_repository = AgentTraceRepository()
