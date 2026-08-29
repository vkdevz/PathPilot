from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class FeedbackCreateRequest(BaseModel):
    learning_path_item_id: Optional[str] = None
    feedback_type: str                   # too_easy, too_hard, useful, not_useful, irrelevant
    notes: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    user_id: str
    learning_path_item_id: Optional[str] = None
    feedback_type: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
