# schemas/message_schemas.py
from pydantic import BaseModel
from datetime import datetime


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
