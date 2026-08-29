from typing import List, Optional, Dict, Any
from database.mongodb import get_database

class CourseRepository:
    def __init__(self):
        self.collection_name = "courses"

    @property
    def collection(self):
        return get_database()[self.collection_name]

    async def get_all_courses(self) -> List[Dict[str, Any]]:
        cursor = self.collection.find({}, {"_id": 0})
        return await cursor.to_list(length=200)

    async def get_course_by_id(self, course_id: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"course_id": course_id}, {"_id": 0})

    async def get_courses_by_skill(self, skill_id: str) -> List[Dict[str, Any]]:
        cursor = self.collection.find({"skills_taught": skill_id}, {"_id": 0})
        return await cursor.to_list(length=100)

    async def upsert_course(self, course_doc: Dict[str, Any]) -> None:
        await self.collection.update_one(
            {"course_id": course_doc["course_id"]},
            {"$set": course_doc},
            upsert=True
        )

course_repository = CourseRepository()
