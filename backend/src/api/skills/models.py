from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from starlette_admin.contrib.sqla import ModelView
from database.db import Base, admin


class Skills(Base):
    __tablename__ = "skills"

    skill_name: Mapped[str] = mapped_column(String(128))


class UsersSkill(Base):
    __tablename__ = "users_skills"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("profiles.user_id"))
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.id"))


admin.add_view(ModelView(UsersSkill))
admin.add_view(ModelView(Skills))
