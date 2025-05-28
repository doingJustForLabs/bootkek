from datetime import datetime

from sqlalchemy import Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.functions import func

from api.enums import Sex, MuctrFaculties, Courses
from api.skills.models import UsersSkill
from database.db import Base


class Profile(Base):
    __tablename__ = "profiles"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True)

    username: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str]

    course: Mapped[Courses | None]
    sex: Mapped[Sex | None]
    faculty: Mapped[MuctrFaculties | None]

    avatar_basename: Mapped[str] = mapped_column(String, default=None, nullable=True)

    subscribers_count: Mapped[int] = mapped_column(Integer, default=0)
    subscriptions_count: Mapped[int] = mapped_column(Integer, default=0)

    update_date: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )

    # Relationships

    skills: Mapped[list["UsersSkill"]] = relationship(
        back_populates="profile", cascade="all, delete-orphan"
    )
