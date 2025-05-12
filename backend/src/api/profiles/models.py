from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.functions import func

from api.followers.models import Follower
from database.db import Base

if TYPE_CHECKING:
    from api.followers.models import Follower


class Profile(Base):
    __tablename__ = "profiles"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True)

    username: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str]

    course: Mapped[int | None]
    sex: Mapped[str | None]
    faculty: Mapped[str | None]

    avatar_basename: Mapped[str] = mapped_column(
        String, default="static/avatars/default-avatar.jpg"
    )

    subscribers_count: Mapped[int] = mapped_column(Integer, default=0)
    subscriptions_count: Mapped[int] = mapped_column(Integer, default=0)

    update_date: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )
