import uuid
from io import BytesIO
from typing import Optional, List

from PIL import Image
from fastapi import UploadFile
from fastapi.responses import FileResponse

from api.exceptions import NotFoundException, BadRequestException, TooEarlyException
from api.profiles.enums import FileSize
from api.profiles.models import (
    Profile,
    ProfileRepository,
    FollowerRepository,
    Follower,
    ProfileRepositoryProtocol,
)
from api.profiles.schemas import ProfileCreateSchema
from core.config import settings
from database.repository import AbstractRepository


class ProfileService:
    def __init__(self, profile_repository: ProfileRepositoryProtocol):
        self.profile_repository = profile_repository

    async def create_profile(
        self, user_id: int, profile_data: ProfileCreateSchema
    ) -> Profile:

        if not (profile_data.username or profile_data.name):
            raise BadRequestException(
                "Both 'name' and 'username' are required for profiles creation"
            )

        if await self.profile_repository.find_by_user_id(user_id):
            raise BadRequestException("Profile already exists")

        if await self.profile_repository.find_by_username(profile_data.username):
            raise BadRequestException("Username already used")

        data = profile_data.model_dump()
        data.update({"user_id": user_id})
        user = await self.profile_repository.add_one(data)
        return user

    async def update_profile(
        self, user_id: int, update_data: ProfileCreateSchema
    ) -> Profile:

        profile = await self.profile_repository.find_one(user_id=user_id)

        if not profile:
            raise NotFoundException("Profile not found")

        if (
            await self.profile_repository.find_one(username=update_data.username)
            and profile.username != update_data.username
        ):
            raise BadRequestException("Username already used")

        data = update_data.model_dump(exclude_none=True)

        if not data:
            raise BadRequestException("Empty data")

        updated_profile = await self.profile_repository.update_one(
            update_data=data, user_id=user_id
        )

        return updated_profile

    async def read_profile(self, user_id: int) -> Profile:
        profile = await self.profile_repository.find_by_user_id(user_id)
        if not profile:
            raise TooEarlyException("User profile didn't created yet")
        return profile

    async def get_profile_by_user_id(self, user_id: int) -> Profile:
        profile = await self.profile_repository.find_by_user_id(user_id)
        if not profile:
            raise NotFoundException("Profile not found")
        return profile

    async def get_profile_by_username(self, username: str) -> Profile:
        profile = await self.profile_repository.find_by_username(username)
        if not profile:
            raise NotFoundException("Profile not found")
        return profile

    async def get_profiles(self) -> List[Profile]:
        profiles = await self.profile_repository.find_all()
        if not profiles:
            raise NotFoundException("Profiles not found")
        return profiles

    # async def search_profiles(
    #     self, q: str, limit: int, page: int, order_by: str, desc: bool
    # ) -> List[Profile]:
    #     profiles = await self.profile_repository.find_all(
    #         limit=limit, offset=page * limit, order_by=order_by, desc=desc
    #     )
    #     return profiles


class AvatarService:

    def __init__(self, profile_repository: type[AbstractRepository]):
        self.profile_repository = profile_repository()
        self.avatar_dir = settings.files.avatar_dir
        self.avatar_dir.mkdir(parents=True, exist_ok=True)
        self._ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png"}
        self._file_sizes = [64, 128, 256]

    async def update_profile_avatar(self, user_id: int, avatar: UploadFile) -> str:
        if avatar.content_type not in self._ALLOWED_AVATAR_TYPES:
            raise BadRequestException("Invalid file type")

        user_avatars = self.avatar_dir / str(user_id)
        user_avatars.mkdir(exist_ok=True, parents=True)

        basename = f"{uuid.uuid4()}"
        file_path = user_avatars / f"{basename}.jpg"

        with open(file_path, "wb+") as buffer:
            buffer.write(image_data := await avatar.read())

        image = Image.open(BytesIO(image_data))

        await self.profile_repository.update_one(
            update_data={"avatar_basename": basename}, user_id=user_id
        )

        avatar_urls = {}

        for size in self._file_sizes:
            image_copy = image.copy()
            image_copy.thumbnail((size, size))

            file_name = f"{basename}_{size}.jpg"
            file_path = user_avatars / file_name

            image_copy.convert("RGB")
            image_copy.save(file_path, format="JPEG")

            avatar_url = f"/static/avatars/{file_name}"
            avatar_urls.update({size: avatar_url})
        print(avatar_urls)
        return basename

    async def get_profile_avatar(
        self, basename: str, file_size: FileSize
    ) -> FileResponse:
        file_path = self.avatar_dir / f"{basename}_{int(file_size.value)}.jpg"
        if not file_path.exists():
            raise NotFoundException("Avatar not found")
        return FileResponse(file_path)


class FollowerService:

    def __init__(
        self,
        follower_repository: type[AbstractRepository],
        profile_repository: type[AbstractRepository],
    ):
        self.follower_repository = follower_repository()
        self.profile_repository = profile_repository()

    async def follow_user(
        self, follower_id: int, followee_id: int
    ) -> Optional[Follower]:
        if followee_id == follower_id:
            return None

        followee = await self.profile_repository.find_one(user_id=followee_id)

        payload = {"follower_id": follower_id, "followee_id": followee_id}
        follower = await self.follower_repository.add_one(data=payload)
        return follower


class SearchService:
    def __init__(self, profile_repository: type[AbstractRepository]):
        self.profile_repository = profile_repository()

    async def search_profiles(
        self, q: str, limit: int, page: int, order_by: str, desc: bool
    ) -> List[Profile]:
        profiles = await self.profile_repository.find_all(
            limit=limit, offset=page * limit, order_by=order_by, desc=desc
        )
        return profiles


def get_profile_service():
    return ProfileService(ProfileRepository)


def get_follower_service():
    return FollowerService(FollowerRepository, ProfileRepository)


def get_avatar_service():
    return AvatarService(ProfileRepository)
