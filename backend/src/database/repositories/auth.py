from datetime import datetime

from pydantic import EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import User


class UserAuthRepository:
    @staticmethod
    async def set_user(session: AsyncSession, email: EmailStr, password: str):
        user = await session.scalar(select(User).where(User.email == email))

        if not user:
            session.add(User(email=email, password=password,
                            create_date=datetime.utcnow(),
                            update_date=datetime.utcnow(),
                            active=True)),
            await session.commit()

    @staticmethod
    async def get_user_by_email(session: AsyncSession, email: EmailStr) -> User | None:
        res = await session.execute(select(User).filter(User.email == email))
        return res.scalar_one_or_none()
