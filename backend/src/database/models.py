from sqlalchemy import String, DATETIME, Boolean, INT, ForeignKey
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(AsyncAttrs, DeclarativeBase):
    pass


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_name: Mapped[str] = mapped_column(String(20))
    email: Mapped[str] = mapped_column(String(20), unique=True)
    password: Mapped[str] = mapped_column(String(20))
    create_date: Mapped[str] = mapped_column(DATETIME)
    update_date: Mapped[str] = mapped_column(DATETIME)
    active: Mapped[bool] = mapped_column(Boolean)

class UserSession(Base):
    __tablename__ = 'user_session'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(INT, ForeignKey('users.id'))
    refresh_token: Mapped[str] = mapped_column(String(30), nullable=False)
    end_date: Mapped[str] = mapped_column(DATETIME)
    start_date: Mapped[str] = mapped_column(DATETIME)
