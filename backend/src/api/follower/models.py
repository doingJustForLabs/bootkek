from datetime import datetime

from sqlalchemy import String, DateTime, INT, ForeignKey, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from database.db import Base
from database.repository import SQLAlchemyRepository


class Follower(Base):
    __tablename__ = "followers"

    id: Mapped[int] = mapped_column(primary_key=True)
    follower_id: [int] = mapped_column(INT, ForeignKey("profile.user_id"))
    target_id: [int] = mapped_column(INT, ForeignKey("profile.user_id"))
    created_at: Mapped[str] = mapped_column(DateTime)

class FollowerRepository(SQLAlchemyRepository):
    model = Follower