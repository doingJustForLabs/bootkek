from sqlalchemy import select

from core.models.database import db_helper
from core.models.models import User


async def set_user(username, email, password):
    async with db_helper.session_factory() as session:
        user = await session.scalar(select(User).where(User.email == email))

        if not user:
            session.add(User(user_name=username, email=email, password=password))
            await session.commit()


async def get_users():
    async with db_helper.session_factory() as session:
        users = await session.scalars(select(User))
        result = users.all()
        return result
