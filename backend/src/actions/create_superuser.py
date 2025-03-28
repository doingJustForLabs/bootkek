import asyncio
from datetime import datetime

from sqlalchemy import select

from api.auth.models import User
from core.config import settings
from database.db import DbSession, db_helper


async def create_super_user(session: DbSession):
    user = await session.scalar(select(User).where(User.email == settings.super_user.email))

    if not user:
        session.add(
            User(
                email=settings.super_user.email,
                password=settings.super_user.password,
                create_date=datetime.now(),
                update_date=datetime.now(),
                active=True,
                is_super_user=True
            )
        ),
        await session.commit()

asyncio.run(create_super_user(session=db_helper.session_getter()))
