from datetime import datetime

from sqlalchemy import String, DateTime, INT, ForeignKey, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from database.db import Base
from database.repository import SQLAlchemyRepository


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    password: Mapped[str] = mapped_column(String)

    role: Mapped[str] = mapped_column(String)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    create_date: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    update_date: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )

    # is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)


class TokenSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(INT, ForeignKey("users.id"))
    refresh_token: Mapped[str] = mapped_column(String, nullable=False)

    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)


class UserRepository(SQLAlchemyRepository):
    model = User


class TokenRepository(SQLAlchemyRepository):
    model = TokenSession
