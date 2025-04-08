from typing import Optional, List

from api.profiles.models import Profile, ProfileRepository
from api.profiles.schemas import ProfileSchema
from database.repository import AbstractRepository


class ProfileService:
    def __init__(self, user_repository: type[AbstractRepository]):
        self.user_repository = user_repository()

    async def create_profile(
        self, user_id: int, profile_data: ProfileSchema
    ) -> Optional[Profile]:

        profile = await self.user_repository.find_one(username=profile_data.username)

        if profile:
            return None

        data = profile_data.model_dump()
        data.update({"user_id": user_id})
        user = await self.user_repository.add_one(data)
        return user

    async def update_profile(
        self, user_id: int, update_data: ProfileSchema
    ) -> Optional[Profile]:

        if update_data.username:
            profile = await self.user_repository.find_one(username=update_data.username)
            if profile:
                return None

        profile = await self.user_repository.update_one(
            user_id, update_data.model_dump(exclude_none=True)
        )
        return profile

    async def update_profile_avatar(self, user_id: int, avatar_basename: str) -> str:
        update_data = {"avatar_basename": avatar_basename}
        profile = await self.user_repository.update_one(user_id, update_data)
        return profile.avatar_basename

    async def get_profile_by_user_id(self, user_id: int) -> Optional[Profile]:
        profile = await self.user_repository.find_one(user_id=user_id)
        return profile if profile else None

    async def get_profile_by_username(self, username: str) -> Optional[Profile]:
        profile = await self.user_repository.find_one(username=username)
        return profile if profile else None

    async def get_profiles(self, **kwargs) -> List[Profile]:
        profiles = await self.user_repository.find_all(**kwargs)
        return profiles if profiles else None


def get_profile_service():
    return ProfileService(ProfileRepository)
