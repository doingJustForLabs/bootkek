from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from typing import TYPE_CHECKING

from api.enums import Skills
from database.db import Base

if TYPE_CHECKING:
    from api.profiles.models import Profile


class Skills(Base):
    __tablename__ = "skills"

    # Columns
    skill_name: Mapped[Skills] = mapped_column(String(128))

    # Relationships
    user_skills: Mapped["UsersSkill"] = relationship(back_populates="skill")


class UsersSkill(Base):
    __tablename__ = "users_skills"

    # Columns
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("profiles.user_id"))
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.id"))

    # Relationships
    profile: Mapped["Profile"] = relationship(back_populates="skills")
    skill: Mapped["Skills"] = relationship(back_populates="user_skills")
