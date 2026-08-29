import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING

logger = logging.getLogger("pathpilot.indexes")

async def create_indexes(db: AsyncIOMotorDatabase) -> None:
    """
    Creates all required indexes across all 10 MongoDB collections.
    """
    logger.info("Verifying and creating MongoDB indexes...")

    # 1. users
    await db["users"].create_index([("firebase_uid", ASCENDING)], unique=True)

    # 2. careers
    await db["careers"].create_index([("career_id", ASCENDING)], unique=True)

    # 3. courses
    await db["courses"].create_index([("course_id", ASCENDING)], unique=True)
    await db["courses"].create_index([("skills_taught", ASCENDING)])
    await db["courses"].create_index([("difficulty", ASCENDING)])

    # 4. sessions
    await db["sessions"].create_index([("session_id", ASCENDING)], unique=True)
    await db["sessions"].create_index([("firebase_uid", ASCENDING)])

    # 5. assessments
    await db["assessments"].create_index([("assessment_id", ASCENDING)], unique=True)
    await db["assessments"].create_index([("session_id", ASCENDING)])
    await db["assessments"].create_index([("firebase_uid", ASCENDING)])

    # 6. assessment_answers
    await db["assessment_answers"].create_index([("assessment_id", ASCENDING)])
    await db["assessment_answers"].create_index([("session_id", ASCENDING)])

    # 7. skill_profiles
    await db["skill_profiles"].create_index([("session_id", ASCENDING)])
    await db["skill_profiles"].create_index([("firebase_uid", ASCENDING)])

    # 8. learning_paths
    await db["learning_paths"].create_index([("session_id", ASCENDING)])
    await db["learning_paths"].create_index([("firebase_uid", ASCENDING)])

    # 9. feedback
    await db["feedback"].create_index([("session_id", ASCENDING)])
    await db["feedback"].create_index([("firebase_uid", ASCENDING)])

    # 10. agent_traces
    await db["agent_traces"].create_index([("session_id", ASCENDING)])
    await db["agent_traces"].create_index([("firebase_uid", ASCENDING)])

    logger.info("MongoDB indexes verified and created successfully.")
