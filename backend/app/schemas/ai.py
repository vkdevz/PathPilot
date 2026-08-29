from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class ToolCallRecord(BaseModel):
    tool_name: str
    tool_input: Dict[str, Any] = Field(default_factory=dict)
    tool_output: Optional[Union[Dict[str, Any], List[Any], str]] = None
    status: str = "success"  # success, error, pending
    execution_time_ms: Optional[float] = None

class AIChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    active_skill: Optional[str] = None
    stream: bool = True

class AITelemetry(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    latency_ms: float = 0.0
    tools_invoked: List[str] = Field(default_factory=list)
    safety_status: str = "passed"

class AIChatResponse(BaseModel):
    conversation_id: str
    user_message_id: str
    assistant_message_id: str
    role: str = "assistant"
    content: str
    tool_calls: List[ToolCallRecord] = Field(default_factory=list)
    telemetry: AITelemetry
    created_at: datetime

class StreamChunk(BaseModel):
    type: str  # text-delta, tool-call, tool-result, finish, error
    content: Optional[str] = None
    tool_call: Optional[ToolCallRecord] = None
    telemetry: Optional[AITelemetry] = None
