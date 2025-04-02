from typing import Optional, List

from api.profiles.models import Profile, ProfileRepository
from api.profiles.schemas import ProfileSchema
from database.repository import AbstractRepository


class ProfileService:
    def __init__(self, user_repository: type[AbstractRepository]):
        self.user_repository = user_repository()

    async def create_profile(self, user_id: int, profile_data: ProfileSchema) -> None:
        data = profile_data.model_dump()
        data.update({"user_id": user_id})
        await self.user_repository.add_one(data)

    async def update_profile(self, user_id: int, update_data: dict) -> None:
        await self.user_repository.update_one(user_id, update_data)

    async def get_profile_by_user_id(self, user_id: int) -> Optional[Profile]:
        profile = await self.user_repository.find_one(id=user_id)
        return profile if profile else None

    async def get_profile_by_username(self, username: str) -> Optional[Profile]:
        profile = await self.user_repository.find_one(username=username)
        return profile if profile else None

    async def get_profiles(self, **kwargs) -> List[Profile]:
        profiles = await self.user_repository.find_all(**kwargs)
        return profiles if profiles else None


def get_profile_service():
    return ProfileService(ProfileRepository)


# class ProfileRepository:
#     @staticmethod
#     async def create_profile(
#         session: AsyncSession, user_id: int, profile_data: ProfileSchema
#     ) -> None:
#         session.add(Profile(user_id=user_id, **profile_data.model_dump()))
#         await session.commit()
#
#     @staticmethod
#     async def update_profile(
#         session: AsyncSession, profile: Profile, update_data: dict
#     ) -> None:
#
#         if "username" in update_data and update_data["username"] != profile.username:
#             existing_profile = await ProfileRepository.get_profile_by_username(
#                 session, update_data["username"]
#             )
#             if existing_profile and existing_profile.user_id != profile.user_id:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="Username is already used",
#                 )
#
#         for key, value in update_data.items():
#             setattr(profile, key, value)
#
#         await session.commit()
#
#     @staticmethod
#     async def get_profiles(session: AsyncSession) -> Iterable[Profile]:
#         users = await session.scalars(select(Profile))
#         result = users.all()
#         return result
#
#     @staticmethod
#     async def get_profile_by_user_id(
#         session: AsyncSession, user_id: int
#     ) -> Optional[Profile]:
#         res = await session.execute(select(Profile).filter(Profile.id == user_id))
#         return res.scalars().first()
#
#     @staticmethod
#     async def get_profile_by_username(
#         session: AsyncSession, username: str
#     ) -> Optional[Profile]:
#         res = await session.execute(
#             select(Profile).filter(Profile.username == username)
#         )
#         return res.scalars().first()
