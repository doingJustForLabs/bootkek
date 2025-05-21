from datetime import datetime

from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.functions import func

from database.db import Base


class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(30), unique=True)
    password: Mapped[str]

    role: Mapped[str] = mapped_column(String(20))
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    update_date: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )

    # Связь с чатами
    chats: Mapped[list["Chat"]] = relationship(
        "Chat", secondary="chat_users", back_populates="users"
    )
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="user")
