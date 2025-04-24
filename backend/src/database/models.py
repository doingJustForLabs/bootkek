from datetime import datetime

from sqlalchemy import String, DateTime, Boolean, INT, ForeignKey, BINARY
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


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

    session = relationship("UserSession", uselist=False, back_populates="user")

class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(INT, ForeignKey("users.id"), unique=True)
    refresh_token: Mapped[str] = mapped_column(String(300), nullable=False)
    start_date: Mapped[str] = mapped_column(DateTime)
    end_date: Mapped[str] = mapped_column(DateTime)

    user = relationship("User", back_populates="session")

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(INT, ForeignKey("users.id"))
    user_name: Mapped[str] = mapped_column(String(20))
    course: Mapped[int] = mapped_column(INT)
    sex: Mapped[str] = mapped_column(String(10))
    faculty: Mapped[str] = mapped_column(String(10))
    subscribers_count: Mapped[int] = mapped_column(INT)
    subscriptions_count: Mapped[int] = mapped_column(INT)


class Subjects(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(primary_key=True)
    subject_name: Mapped[str] = mapped_column(String(20))

class Posts(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(INT, ForeignKey("profiles.user_id"))
    subject_id: Mapped[int] = mapped_column(INT, ForeignKey("subjects.id"))
    description: Mapped[int] = mapped_column(String(100))

class Follower(Base):
    __tablename__ = "followers"

    id: Mapped[int] = mapped_column(primary_key=True)
    follower_id: [int] = mapped_column(INT, ForeignKey("profile.user_id"))
    target_id: [int] = mapped_column(INT, ForeignKey("profile.user_id"))
    created_at: Mapped[str] = mapped_column(DateTime)
