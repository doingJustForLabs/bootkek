from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing_extensions import Optional

from api.profile.models import Profile
from api.profile.schemas import ProfileSchema


class ProfileRepository:
    @staticmethod
    async def create_and_update_profile(
        session: AsyncSession, user_id: int, profile_data: ProfileSchema
    ) -> None:
        # Если пользователя нет - создать с обязательными полями
        # Если пользователь уже есть - обновлять его поля данными из profile_data
        ...

    @staticmethod
    async def get_profile_by_user_id(
        session: AsyncSession, user_id: int
    ) -> Optional[Profile]:
        res = await session.execute(select(Profile).filter(Profile.id == user_id))
        return res.scalars().first()

    @staticmethod
    async def get_profile_by_username(
        session: AsyncSession, username: str
    ) -> Optional[Profile]:
        res = await session.execute(
            select(Profile).filter(Profile.username == username)
        )
        return res.scalars().first()
