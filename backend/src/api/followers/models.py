from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm.attributes import Mapped

from database.db import Base


class Follower(Base):
    __tablename__ = "followers"

    follower_id: Mapped[int] = mapped_column(Integer, ForeignKey("profiles.user_id"))
    target_id: Mapped[int] = mapped_column(Integer, ForeignKey("profiles.user_id"))
