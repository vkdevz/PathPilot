"""
Database module wrapper pointing to the async MongoDB database package.
"""
from database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from database.seed import seed_database

__all__ = ["connect_to_mongo", "close_mongo_connection", "get_database", "seed_database"]
