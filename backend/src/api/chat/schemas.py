from pydantic import BaseModel
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

    class Config:
        from_attributes = (
            True  # Это позволяет использовать SQLAlchemy объекты для сериализации
        )

class ChatSchema(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        orm_mode = True