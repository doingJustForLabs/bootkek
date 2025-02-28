from database.postgres.models import User, async_session
from sqlalchemy import select, update, delete, text

async def set_user(username, email, password) -> None:
    async with async_session() as session:
        user = await session.scalar(select(User).where(User.email == email))

        if not user:
            session.add(User(user_name=username, email=email, password=password))
            await session.commit()

async def get_users():
    async with async_session() as session:
        users = await session.scalars(select(User))
        result = users.all()
        return result

