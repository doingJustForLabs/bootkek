from sqlalchemy import Integer, String, ForeignKey
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
    avatar_url: Mapped[str] = mapped_column(
        String, default="static/avatar/default-avatar.jpg"
    )


class ProfileRepository(SQLAlchemyRepository):
    model = Profile
