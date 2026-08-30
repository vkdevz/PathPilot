import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies.auth import get_current_user, get_current_user_optional
from app.models.user import User
from app.schemas.ai import AIChatRequest, AIChatResponse
from app.schemas.chat import (
    ConversationResponse,
    ConversationSummary,
    ConversationCreateRequest,
    MessageResponse
)
from app.repositories.chat_repository import ChatRepository
from app.services.ai.ai_service import AIService
from typing import Optional

logger = logging.getLogger("pathpilot.api.chat")
router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/chat", summary="Stream conversational response with tool routing and context injection")
async def chat_streaming(
    request: AIChatRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else "usr-dev-01"
    ai_service = AIService(db, user_id=user_id)
    return StreamingResponse(
        ai_service.chat_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/chat/sync", response_model=AIChatResponse, summary="Synchronous chat completion")
async def chat_synchronous(
    request: AIChatRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else "usr-dev-01"
    ai_service = AIService(db, user_id=user_id)
    return await ai_service.chat_sync(request)


@router.get("/conversations", response_model=List[ConversationSummary], summary="List user chat conversations")
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ChatRepository(db)
    convs = await repo.get_user_conversations(current_user.id)
    summaries = []
    for c in convs:
        last_msg = c.messages[-1].content[:60] + "..." if c.messages else "No messages yet"
        summaries.append(
            ConversationSummary(
                id=c.id,
                user_id=c.user_id,
                title=c.title,
                created_at=c.created_at,
                updated_at=c.updated_at,
                message_count=len(c.messages),
                last_message_preview=last_msg
            )
        )
    return summaries

@router.post("/conversations", response_model=ConversationResponse, summary="Create a new chat conversation session")
async def create_conversation(
    body: ConversationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ChatRepository(db)
    conv = await repo.create_conversation(current_user.id, title=body.title or "AI Tutoring Session")
    return conv

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse], summary="Get messages for a conversation")
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ChatRepository(db)
    conv = await repo.get_conversation_by_id(conversation_id, user_id=current_user.id)
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    return conv.messages

@router.delete("/conversations/{conversation_id}", summary="Delete a conversation")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ChatRepository(db)
    deleted = await repo.delete_conversation(conversation_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    return {"status": "success", "message": "Conversation deleted"}
