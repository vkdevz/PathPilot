import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.chat_repository import ChatRepository

@pytest.mark.asyncio
async def test_conversation_crud_and_messages(db_session: AsyncSession):
    repo = ChatRepository(db_session)
    user_id = "user-persist-001"
    
    # 1. Create conversation
    conv = await repo.create_conversation(user_id, title="Algorithm Deep Dive")
    assert conv.id is not None
    assert conv.title == "Algorithm Deep Dive"

    # 2. Add messages
    m1 = await repo.add_message(conv.id, role="user", content="Explain binary search.")
    m2 = await repo.add_message(conv.id, role="assistant", content="Binary search runs in O(log n).", tool_calls=[{"tool_name": "get_skill_details_and_prerequisites"}])
    assert m1.id is not None
    assert m2.tool_calls is not None

    # 3. Retrieve conversation with messages
    fetched_conv = await repo.get_conversation_by_id(conv.id, user_id=user_id)
    assert fetched_conv is not None
    assert len(fetched_conv.messages) == 2

    # 4. List user conversations
    user_convs = await repo.get_user_conversations(user_id)
    assert len(user_convs) == 1

    # 5. Delete conversation
    deleted = await repo.delete_conversation(conv.id, user_id=user_id)
    assert deleted is True
    
    # Verify deletion
    after_del = await repo.get_conversation_by_id(conv.id, user_id=user_id)
    assert after_del is None
