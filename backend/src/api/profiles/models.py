from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from database.db import Base
from database.repository import SQLAlchemyRepository


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


# class ProfileRepository(SQLAlchemyRepository):
#     model = Profile
