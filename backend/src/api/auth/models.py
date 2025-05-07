from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from database.db import Base
from database.repository import SQLAlchemyRepository


class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(30), unique=True)
    password: Mapped[str]

    role: Mapped[str] = mapped_column(String(20))
    active: Mapped[bool] = mapped_column(Boolean, default=True)


# class UserRepository(SQLAlchemyRepository):
#     model = User
