from sqlalchemy import String, DateTime, Boolean, INT, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from database.models import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(30), unique=True)
    password: Mapped[str] = mapped_column(String(70))
    create_date: Mapped[str] = mapped_column(DateTime)
    update_date: Mapped[str] = mapped_column(DateTime)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(INT, ForeignKey("users.id"))
    refresh_token: Mapped[str] = mapped_column(String(300), nullable=False)
    start_date: Mapped[str] = mapped_column(DateTime)
    end_date: Mapped[str] = mapped_column(DateTime)
