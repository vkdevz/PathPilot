import json
import logging
from typing import AsyncGenerator, Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from app.repositories.chat_repository import ChatRepository
from app.schemas.ai import AIChatRequest, AIChatResponse, ToolCallRecord, AITelemetry
from app.services.ai.context_builder import ContextBuilder
from app.services.ai.tool_router import ToolRouter
from app.services.ai.safety_guardrails import SafetyGuardrails
from app.services.ai.llm_client import LLMClient

logger = logging.getLogger("pathpilot.ai.service")

class AIService:
    def __init__(self, db: AsyncSession, user_id: str):
        self.db = db
        self.user_id = user_id
        self.chat_repo = ChatRepository(db)
        self.context_builder = ContextBuilder(db)
        self.tool_router = ToolRouter(db, user_id)
        self.llm_client = LLMClient(tool_router=self.tool_router)

    async def chat_sync(self, request: AIChatRequest) -> AIChatResponse:
        """
        Synchronous conversation turn: saves user message, invokes LLM with tools, saves assistant message and tool records.
        """
        # 1. Safety validation
        is_safe, refusal = SafetyGuardrails.validate_user_input(request.message)
        if not is_safe:
            conv = await self._get_or_create_conv(request.conversation_id)
            u_msg = await self.chat_repo.add_message(conv.id, role="user", content=request.message)
            a_msg = await self.chat_repo.add_message(conv.id, role="assistant", content=refusal)
            return AIChatResponse(
                conversation_id=conv.id,
                user_message_id=u_msg.id,
                assistant_message_id=a_msg.id,
                role="assistant",
                content=refusal,
                tool_calls=[],
                telemetry=AITelemetry(safety_status="rejected_input"),
                created_at=datetime.now(timezone.utc)
            )

        # 2. Get or create conversation & record user message
        conv = await self._get_or_create_conv(request.conversation_id)
        user_msg_record = await self.chat_repo.add_message(
            conversation_id=conv.id,
            role="user",
            content=request.message
        )

        # 3. Build verified learner context
        context = await self.context_builder.build_learner_context(
            self.user_id,
            active_skill_hint=request.active_skill
        )
        system_prompt = self.context_builder.format_system_prompt(context)

        # 4. Load recent message history
        history_records = await self.chat_repo.get_messages_for_conversation(conv.id)
        chat_messages = []
        for m in history_records[-10:]:
            chat_messages.append({"role": m.role, "content": m.content})

        # 5. Generate response with LLM & ToolRouter
        content, tool_records, telemetry = await self.llm_client.generate_response(
            system_prompt=system_prompt,
            messages=chat_messages,
            context=context
        )

        # 6. Safety output check
        content = SafetyGuardrails.verify_output_grounding(content, context)

        # 7. Persist assistant message with tool calls in PostgreSQL
        tool_dicts = [t.model_dump() for t in tool_records] if tool_records else None
        asst_msg_record = await self.chat_repo.add_message(
            conversation_id=conv.id,
            role="assistant",
            content=content,
            tool_calls=tool_dicts
        )

        return AIChatResponse(
            conversation_id=conv.id,
            user_message_id=user_msg_record.id,
            assistant_message_id=asst_msg_record.id,
            role="assistant",
            content=content,
            tool_calls=tool_records,
            telemetry=telemetry,
            created_at=asst_msg_record.created_at or datetime.now(timezone.utc)
        )

    async def chat_stream(self, request: AIChatRequest) -> AsyncGenerator[str, None]:
        """
        Streaming conversation turn yielding Server-Sent Events (SSE) data lines.
        """
        # 1. Safety validation
        is_safe, refusal = SafetyGuardrails.validate_user_input(request.message)
        conv = await self._get_or_create_conv(request.conversation_id)

        if not is_safe:
            await self.chat_repo.add_message(conv.id, role="user", content=request.message)
            await self.chat_repo.add_message(conv.id, role="assistant", content=refusal)
            yield f"data: {json.dumps({'type': 'text-delta', 'content': refusal})}\n\n"
            yield f"data: {json.dumps({'type': 'finish', 'telemetry': {'safety_status': 'rejected_input'}})}\n\n"
            return

        # 2. Record user message
        await self.chat_repo.add_message(conv.id, role="user", content=request.message)

        # 3. Context & Prompt
        context = await self.context_builder.build_learner_context(
            self.user_id,
            active_skill_hint=request.active_skill
        )
        system_prompt = self.context_builder.format_system_prompt(context)

        # 4. Message history
        history_records = await self.chat_repo.get_messages_for_conversation(conv.id)
        chat_messages = [{"role": m.role, "content": m.content} for m in history_records[-10:]]

        full_content_acc = []
        tool_records_acc = []

        async for chunk in self.llm_client.generate_stream(system_prompt, chat_messages, context):
            ctype = chunk.get("type")
            if ctype == "tool-call":
                t_call = chunk.get("tool_call")
                if t_call:
                    tool_records_acc.append(t_call)
                yield f"data: {json.dumps(chunk)}\n\n"
            elif ctype == "text-delta":
                txt = chunk.get("content", "")
                full_content_acc.append(txt)
                yield f"data: {json.dumps(chunk)}\n\n"
            elif ctype == "finish":
                # Persist full assistant message
                final_content = "".join(full_content_acc)
                await self.chat_repo.add_message(
                    conversation_id=conv.id,
                    role="assistant",
                    content=final_content,
                    tool_calls=tool_records_acc if tool_records_acc else None
                )
                yield f"data: {json.dumps(chunk)}\n\n"

    async def _get_or_create_conv(self, conversation_id: Optional[str] = None):
        if conversation_id:
            conv = await self.chat_repo.get_conversation_by_id(conversation_id, user_id=self.user_id)
            if conv:
                return conv
        return await self.chat_repo.get_or_create_conversation(self.user_id)
