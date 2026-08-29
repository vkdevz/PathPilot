from typing import List, Optional, Dict, Any
from database.mongodb import get_database

class CareerRepository:
    def __init__(self):
        self.collection_name = "careers"

    @property
    def collection(self):
        return get_database()[self.collection_name]

    async def get_all_careers(self) -> List[Dict[str, Any]]:
        cursor = self.collection.find({}, {"_id": 0})
        return await cursor.to_list(length=100)

    async def get_career_by_id(self, career_id: str) -> Optional[Dict[str, Any]]:
        # Match either exact career_id or alt variant with hyphen/underscore
        alt_id = career_id.replace("-", "_") if "-" in career_id else career_id.replace("_", "-")
        return await self.collection.find_one(
            {"$or": [{"career_id": career_id}, {"career_id": alt_id}, {"career_id_alt": career_id}]},
            {"_id": 0}
        )

    async def upsert_career(self, career_doc: Dict[str, Any]) -> None:
        await self.collection.update_one(
            {"career_id": career_doc["career_id"]},
            {"$set": career_doc},
            upsert=True
        )

career_repository = CareerRepository()
