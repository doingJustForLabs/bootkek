from datetime import datetime

from sqlalchemy import Integer, String, ForeignKey, func, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from database.db import Base
from database.repository import SQLAlchemyRepository

class Skills(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer)
    skill_name: Mapped[str] = mapped_column(String(30))

class UsersSkill(Base):
    __tablename__ = "users_skills"

    id: Mapped[int] = mapped_column(Integer)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("profiles.user_id"))
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.id"))
