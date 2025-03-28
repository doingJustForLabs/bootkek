from typing import Iterable

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from typing_extensions import Optional

from api.profiles.models import Profile
from api.profiles.schemas import ProfileSchema


class ProfileRepository:
    @staticmethod
    async def create_profile(
        session: AsyncSession, user_id: int, profile_data: ProfileSchema
    ) -> None:
        session.add(Profile(user_id=user_id, **profile_data.model_dump()))
        await session.commit()

    @staticmethod
    async def update_profile(
        session: AsyncSession, profile: Profile, update_data: dict
    ) -> None:

        if "username" in update_data and update_data["username"] != profile.username:
            existing_profile = await ProfileRepository.get_profile_by_username(
                session, update_data["username"]
            )
            if existing_profile and existing_profile.user_id != profile.user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username is already used",
                )

        for key, value in update_data.items():
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
