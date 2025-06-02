from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime


class CreateChatRequest(BaseModel):
    name: Optional[str] = None
    user_ids: List[int]


class MessageResponse(BaseModel):
    id: int
    chat_id: int
    user_id: int
    content: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSchema(BaseModel):
    id: int
    name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)