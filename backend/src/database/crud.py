from datetime import datetime, timedelta

from pydantic import EmailStr
from sqlalchemy import select

from database.db import db_helper
from database.models import User, UserSession


async def set_user(email: EmailStr, password: str):
    async with db_helper.session_factory() as session:
        user = await session.scalar(select(User).where(User.email == email))

        if not user:
            session.add(
                User(email=email, password=password),
                create_date=datetime.utcnow(),
                update_date=datetime.utcnow(),
                active=True,
            )
            await session.commit()


async def get_users():
    async with db_helper.session_factory() as session:
        users = await session.scalars(select(User))
        result = users.all()
        return result


async def get_user_by_user_id(user_id: int):
    async with db_helper.session_factory() as session:
        users = await session.scalars(select(User).filter(User.id == user_id))
        result = users.first()
        return result


async def start_user_session(user_id, refresh_token):
    async with db_helper.session_factory() as session:
        current_datetime = datetime.now()
        current_datetime_str = current_datetime.strftime("%Y-%m-%d %H:%M:%S")
        time_offset = timedelta(days=15)
        future_datetime = current_datetime + time_offset
        future_datetime_str = future_datetime.strftime("%Y-%m-%d %H:%M:%S")
        session.add(
            UserSession(
                user_id=user_id,
                reftesh_token=refresh_token,
                start_date=current_datetime_str,
                end_date=future_datetime_str,
            )
        )
        await session.commit()
