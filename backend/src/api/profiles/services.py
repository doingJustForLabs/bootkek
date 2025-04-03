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

    async def update_profile_avatar(self, user_id: int, avatar_url: str) -> None:
        update_data = {"avatar_url": avatar_url}
        await self.user_repository.update_one(user_id, update_data)

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
