from sqlalchemy import String, DateTime, Boolean, INT, ForeignKey
# from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from database.models import Base  # Импорт базового класса
from database.models import User

class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    users: Mapped["ChatUser"] = relationship("ChatUser", back_populates="chat")
    messages: Mapped["Message"] = relationship("Message", back_populates="chat")

class ChatUser(Base):
    __tablename__ = "chat_users"

    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id"), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    join_date: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    chat: Mapped[Chat] = relationship("Chat", back_populates="users")
    user: Mapped["User"] = relationship("User", back_populates="chats")

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(String(1000))
    timestamp: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    chat: Mapped[Chat] = relationship("Chat", back_populates="messages")
    user: Mapped["User"] = relationship("User", back_populates="messages")