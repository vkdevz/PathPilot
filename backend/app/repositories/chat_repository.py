from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.models.chat import Conversation, Message

class ChatRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_conversation(self, user_id: str, title: str = "AI Tutoring Session") -> Conversation:
        stmt = (
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .execution_options(populate_existing=True)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.created_at.desc())
        )
        result = await self.db.execute(stmt)
        conv = result.scalar_one_or_none()
        if not conv:
            conv = Conversation(user_id=user_id, title=title)
            self.db.add(conv)
            await self.db.flush()
            stmt = (
                select(Conversation)
                .options(selectinload(Conversation.messages))
                .execution_options(populate_existing=True)
                .where(Conversation.id == conv.id)
            )
            res = await self.db.execute(stmt)
            conv = res.scalar_one()
        return conv

    async def get_user_conversations(self, user_id: str) -> List[Conversation]:
        stmt = (
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .execution_options(populate_existing=True)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc(), Conversation.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_conversation_by_id(self, conversation_id: str, user_id: Optional[str] = None) -> Optional[Conversation]:
        stmt = (
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .execution_options(populate_existing=True)
            .where(Conversation.id == conversation_id)
        )
        if user_id:
            stmt = stmt.where(Conversation.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_conversation(self, user_id: str, title: str = "AI Tutoring Session") -> Conversation:
        conv = Conversation(user_id=user_id, title=title)
        self.db.add(conv)
        await self.db.flush()
        stmt = (
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .execution_options(populate_existing=True)
            .where(Conversation.id == conv.id)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one()

    async def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        stmt = select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user_id)
        result = await self.db.execute(stmt)
        conv = result.scalar_one_or_none()
        if not conv:
            return False
        await self.db.delete(conv)
        await self.db.flush()
        return True

    async def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        tool_calls: Optional[List[Dict[str, Any]]] = None
    ) -> Message:
        msg = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tool_calls=tool_calls
        )
        self.db.add(msg)
        await self.db.flush()
        return msg

    async def get_messages_for_conversation(self, conversation_id: str) -> List[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
