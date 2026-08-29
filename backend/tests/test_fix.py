import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from database.seed import seed_database
from repositories.session_repository import session_repository
from repositories.career_repository import career_repository
from main import app, start_session, select_session_career, StartSessionRequest, SelectCareerRequest

async def verify_exact_user_session():
    print("=" * 60)
    print("TESTING EXACT SESSION BUG FIX FOR session_cd08789514f")
    print("=" * 60)

    db = await connect_to_mongo()
    await seed_database()

    target_session_id = "session_cd08789514f"
    target_career_id = "data-analyst"

    # Clean previous test run if exists
    await db["sessions"].delete_one({"session_id": target_session_id})

    # 1. Start session with session_cd08789514f
    req_start = StartSessionRequest(session_id=target_session_id)
    res_start = await start_session(req_start)
    print("Start session response:", res_start)
    assert res_start["session_id"] == target_session_id

    # Verify session document exists in MongoDB
    mongo_session = await db["sessions"].find_one({"session_id": target_session_id})
    assert mongo_session is not None
    print("[CONFIRMED] Session document created in MongoDB sessions collection:", mongo_session["session_id"])

    # 2. Call select_session_career with target_session_id & data-analyst
    req_career = SelectCareerRequest(career_id=target_career_id)
    res_career = await select_session_career(session_id=target_session_id, req=req_career)
    print("Select career response:", res_career)
    assert res_career["session_id"] == target_session_id
    assert res_career["selected_career"] in ("data-analyst", "data_analyst")

    # 3. Verify in MongoDB Compass / pymongo query that MongoDB document is updated
    updated_mongo_session = await db["sessions"].find_one({"session_id": target_session_id})
    print("[CONFIRMED] MongoDB sessions document after update:", updated_mongo_session)
    assert updated_mongo_session["selected_career"] in ("data-analyst", "data_analyst")

    await close_mongo_connection()
    print("=" * 60)
    print("ALL VERIFICATION CHECKS FOR session_cd08789514f PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(verify_exact_user_session())
