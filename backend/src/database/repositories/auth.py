from datetime import datetime, timedelta
from typing import Optional

from pydantic import EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import User, UserSession


class UserAuthRepository:
    @staticmethod
    async def start_user(session: AsyncSession, email: EmailStr, password: str):
        user = await session.scalar(select(User).where(User.email == email))

        if not user:
            session.add(
                User(
                    email=email,
                    password=password,
                    create_date=datetime.now(),
                    update_date=datetime.now(),
                    active=True,
                )
            ),
            await session.commit()

    @staticmethod
    async def get_user_by_email(
        session: AsyncSession, email: EmailStr
    ) -> Optional[User]:
        res = await session.execute(select(User).filter(User.email == email))
        return res.scalar_one_or_none()

    @staticmethod
    async def start_user_session(
        session: AsyncSession, user_id: int, refresh_token: str
    ):
        time_offset = timedelta(days=15)
        current_datetime = datetime.now()
        future_datetime = current_datetime + time_offset
        session.add(
            UserSession(
                user_id=user_id,
                refresh_token=refresh_token,
                start_date=current_datetime,
                end_date=future_datetime,
            )
        )
        await session.commit()

    @staticmethod
    async def get_user_session_by_user_id(
        session: AsyncSession, user_id: int
    ) -> Optional[UserSession]: ...
