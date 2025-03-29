from datetime import datetime, timedelta

from pydantic import EmailStr
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from api.auth.models import User, UserSession
from core.config import settings


class UserRepository:
    @classmethod
    async def create_user(cls, session: AsyncSession, email: EmailStr, password: str):
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
    async def get_user_by_email(session: AsyncSession, email: EmailStr) -> User:
        res = await session.execute(select(User).filter(User.email == email))
        return res.scalars().first()

    @staticmethod
    async def get_user_by_user_id(session: AsyncSession, user_id: int) -> User:
        res = await session.execute(select(User).filter(User.id == user_id))
        return res.scalars().first()


class TokenRepository:
    @staticmethod
    async def create_token_session(
        session: AsyncSession, user_id: int, refresh_token: str
    ):
        await session.execute(delete(UserSession).where(UserSession.user_id == user_id))

        time_offset: timedelta = settings.jwt.refresh_token.expires
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
    async def get_token_session_by_user_id(
        session: AsyncSession, user_id: int
    ) -> UserSession:
        res = await session.execute(
            select(UserSession).filter(UserSession.user_id == user_id)
        )
        return res.scalars().first()

    @staticmethod
    async def get_token_session_by_token(
        session: AsyncSession, refresh_token: str
    ) -> UserSession:
        res = await session.execute(
            select(UserSession).filter(UserSession.refresh_token == refresh_token)
        )
        return res.scalars().first()

    @staticmethod
    async def delete_user_session(
        session: AsyncSession, user_id: int
    ) -> None:
        stmt = delete(UserSession).where(UserSession.user_id == user_id)
        await session.execute(stmt)
        await session.commit()
