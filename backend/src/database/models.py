from datetime import datetime

from sqlalchemy import String, DateTime, Boolean, INT, ForeignKey, BINARY
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(AsyncAttrs, DeclarativeBase):
    pass


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(30), unique=True)
    password: Mapped[str] = mapped_column(String(70))
    create_date: Mapped[str] = mapped_column(DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    update_date: Mapped[str] = mapped_column(DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class UserSession(Base):
    __tablename__ = 'user_sessions'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(INT, ForeignKey('users.id'))
    refresh_token: Mapped[str] = mapped_column(String(30), nullable=False)
    end_date: Mapped[str] = mapped_column(DateTime)
    start_date: Mapped[str] = mapped_column(DateTime)
