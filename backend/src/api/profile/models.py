from sqlalchemy import Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from database.models import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True)
    username: Mapped[str] = mapped_column(String, nullable=False)

    surname: Mapped[str] = mapped_column(String)

    is_required_completed: Mapped[bool] = mapped_column(
        Boolean, nullable=True, default=False
    )

    # name = Column(String, nullable=False)
    # sex = Column(Integer)
    # birthdate = Column(Date)
    # city = Column(String)
    # status = Column(String)
