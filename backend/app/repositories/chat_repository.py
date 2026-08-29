from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.chat import Conversation, Message

class ChatRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_conversation(self, user_id: str, title: str = "AI Tutoring Session") -> Conversation:
        stmt = (
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.created_at.desc())
        )
        result = await self.db.execute(stmt)
        conv = result.scalar_one_or_none()
        if not conv:
            conv = Conversation(user_id=user_id, title=title)
            self.db.add(conv)
            await self.db.flush()
        return conv

    async def add_message(self, conversation_id: str, role: str, content: str) -> Message:
        msg = Message(conversation_id=conversation_id, role=role, content=content)
        self.db.add(msg)
        await self.db.flush()
        return msg
