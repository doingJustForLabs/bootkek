from datetime import datetime

from sqlalchemy import Integer, String, ForeignKey, func, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from database.db import Base
from database.repository import SQLAlchemyRepository


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True)

    username: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)

    course: Mapped[int] = mapped_column(Integer, nullable=True)
    sex: Mapped[str] = mapped_column(String, nullable=True)
    faculty: Mapped[str] = mapped_column(String, nullable=True)
    avatar_basename: Mapped[str] = mapped_column(String, default="default-avatar")

    create_date: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    update_date: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )


class ProfileRepository(SQLAlchemyRepository):
    model = Profile
