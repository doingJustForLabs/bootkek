from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from typing import TYPE_CHECKING

from api.enums import Skills
from database.db import Base

if TYPE_CHECKING:
    from api.profiles.models import Profile


class Skills(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    skill_name: Mapped[str] = mapped_column(String(128))

    user_skills: Mapped[list["UsersSkill"]] = relationship(back_populates="skill")


class UsersSkill(Base):
    __tablename__ = "users_skills"

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("profiles.user_id"), primary_key=True
    )
    skill_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("skills.id"), primary_key=True
    )

    profile: Mapped["Profile"] = relationship(back_populates="skills")
    skill: Mapped["Skills"] = relationship(back_populates="user_skills")
