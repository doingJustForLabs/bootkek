from sqlalchemy import String, DateTime, Boolean, INT, ForeignKey
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func

class Base(AsyncAttrs, DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(30), unique=True)
    password: Mapped[str] = mapped_column(String(70))
    create_date: Mapped[str] = mapped_column(DateTime)
    update_date: Mapped[str] = mapped_column(DateTime)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Связь с чатами через таблицу связи ChatUser
    chats: Mapped[list["Chat"]] = relationship("Chat", secondary="chat_users", back_populates="users")
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="user")


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(INT, ForeignKey("users.id"))
    refresh_token: Mapped[str] = mapped_column(String(300), nullable=False)
    start_date: Mapped[str] = mapped_column(DateTime)
    end_date: Mapped[str] = mapped_column(DateTime)



# В модели Chat
class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=func.now())

    # Связь с пользователями через таблицу связи
    users: Mapped[list["User"]] = relationship("User", secondary="chat_users", back_populates="chats")
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="chat")

# В модели ChatUser
class ChatUser(Base):
    __tablename__ = "chat_users"

    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id"), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    join_date: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=func.now())

    # chat: Mapped["Chat"] = relationship("Chat", back_populates="users")
    # user: Mapped["User"] = relationship("User", back_populates="chats")


# Модель сообщения
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(String(1000))
    timestamp: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=func.now())

    chat: Mapped["Chat"] = relationship("Chat", back_populates="messages")
    user: Mapped["User"] = relationship("User", back_populates="messages")