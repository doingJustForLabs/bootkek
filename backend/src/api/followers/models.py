from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm.attributes import Mapped
from starlette_admin.contrib.sqla import ModelView

from database.db import Base, admin


class Follower(Base):
    __tablename__ = "followers"

    follower_id: Mapped[int] = mapped_column(Integer, ForeignKey("profiles.user_id"))
    target_id: Mapped[int] = mapped_column(Integer, ForeignKey("profiles.user_id"))


admin.add_view(ModelView(Follower))
