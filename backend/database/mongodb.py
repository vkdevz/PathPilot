import os
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "path_pilot")

logger = logging.getLogger("pathpilot.database")

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

db_manager = DatabaseManager()

async def connect_to_mongo() -> AsyncIOMotorDatabase:
    """
    Initialize the Motor client and database connection on application startup.
    Fails clearly if MongoDB is unavailable.
    """
    if db_manager.db is not None and db_manager.client is not None:
        return db_manager.db

    logger.info(f"Connecting to MongoDB at {MONGODB_URI}...")

    try:
        db_manager.client = AsyncIOMotorClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )
        # Verify connection with server info ping
        await db_manager.client.admin.command('ping')
        db_manager.db = db_manager.client[MONGODB_DATABASE]
        logger.info(f"Successfully connected to MongoDB database: {MONGODB_DATABASE}")
        return db_manager.db
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise RuntimeError(f"MongoDB connection failed: {e}") from e

async def close_mongo_connection():
    """
    Close MongoDB connection on application shutdown.
    """
    if db_manager.client:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        db_manager.client = None
        db_manager.db = None
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase:
    """
    Returns the active database instance.
    """
    if db_manager.db is None:
        raise RuntimeError("Database connection has not been initialized. Call connect_to_mongo() first.")
    return db_manager.db
