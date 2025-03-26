from typing import Iterable

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing_extensions import Optional

from api.profile.models import Profile
from api.profile.schemas import ProfileSchema


class ProfileRepository:
    @staticmethod
    async def create_profile(
        session: AsyncSession, user_id: int, profile_data: ProfileSchema
    ) -> None:

        profile = await session.scalar(
            select(Profile).where(Profile.user_id == user_id)
        )

        if not profile:
            session.add(Profile(user_id=user_id, **profile_data.model_dump())),
        else:
            for key, value in profile_data.model_dump().items():
                setattr(profile, key, value)

        await session.commit()

    @staticmethod
    async def get_profiles(session: AsyncSession) -> Iterable[Profile]:
        users = await session.scalars(select(Profile))
        result = users.all()
        return result

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
