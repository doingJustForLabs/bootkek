from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, ForeignKey, func, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.db import Base

if TYPE_CHECKING: from api.profiles.models import Profile

class Skills(Base):
    __tablename__ = "skills"

    skill_name: Mapped[str] = mapped_column(String(30))
    users: Mapped[list["UsersSkill"]] = relationship(back_populates="skill")


class UsersSkill(Base):
    __tablename__ = "users_skills"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("profiles.user_id"))
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.id"))
    profile: Mapped["Profile"] = relationship(back_populates="skills")
    skill: Mapped["Skills"] = relationship(back_populates="users")
