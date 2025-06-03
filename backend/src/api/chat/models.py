from typing import Optional

from sqlalchemy import String, DateTime, Boolean, INT, ForeignKey

# from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from database.db import Base  # Импорт базового класса


class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    users: Mapped[list["User"]] = relationship(
        "User", secondary="chat_users", back_populates="chats"
    )
    messages: Mapped[list["Message"]] = relationship(
        "Message", back_populates="chat", cascade="all, delete-orphan"
    )


class ChatUser(Base):
    __tablename__ = "chat_users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    # user_email: Mapped[str] = mapped_column(ForeignKey("users.email"), primary_key=True)  # Изменено
    join_date: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    chat: Mapped["Chat"] = relationship(back_populates=None)
    user: Mapped["User"] = relationship(back_populates=None)


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(String(1000), nullable=True)

    file_path: Mapped[str] = mapped_column(String, nullable=True)  # путь к файлу, если он есть
    file_name: Mapped[str] = mapped_column(String, nullable=True)  # имя файла
    file_type: Mapped[str] = mapped_column(String, nullable=True)  # тип файла (например, изображение, pdf)
    file_size: Mapped[Optional[int]] = mapped_column(nullable=True)

    timestamp: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    chat: Mapped["Chat"] = relationship("Chat", back_populates="messages")
    user: Mapped["User"] = relationship("User", back_populates="messages")
