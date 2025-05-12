from typing import TYPE_CHECKING

from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.orm.attributes import Mapped

from database.db import Base

if TYPE_CHECKING:
    from api.profiles.models import Profile


class Follower(Base):
    __tablename__ = "followers"

    follower_id: Mapped[int] = mapped_column(Integer, ForeignKey("profiles.user_id"))
    target_id: Mapped[int] = mapped_column(Integer, ForeignKey("profiles.user_id"))
