import uuid
from io import BytesIO
from typing import Optional, List

from PIL import Image
from fastapi import UploadFile
from fastapi.responses import FileResponse

from api.exceptions import NotFoundException, BadRequestException, TooEarlyException
from api.enums import FileSize
from api.profiles.models import (
    Profile,
    ProfileRepository,
    FollowerRepository,
    Follower,
)
from api.profiles.schemas import ProfileCreateSchema
from core.config import settings
from database.repository import AbstractRepository


class ProfileService:
    def __init__(self, profile_repository: type[AbstractRepository]):
        self.profile_repository = profile_repository()

    async def create_profile(
        self, user_id: int, profile_data: ProfileCreateSchema
    ) -> Profile:

        if not (profile_data.username or profile_data.name):
            raise BadRequestException(
                "Both 'name' and 'username' are required for profiles creation"
            )

        if await self.profile_repository.find_one(user_id=user_id):
            raise BadRequestException("Profile already exists")

        if await self.profile_repository.find_one(username=profile_data.username):
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
        profile = await self.profile_repository.find_one(user_id=user_id)
        if not profile:
            raise TooEarlyException("User profile didn't created yet")
        return profile

    async def get_profile_by_user_id(self, user_id: int) -> Profile:
        profile = await self.profile_repository.find_one(user_id=user_id)
        if not profile:
            raise NotFoundException("Profile not found")
        return profile

    async def get_profile_by_username(self, username: str) -> Profile:
        profile = await self.profile_repository.find_one(username=username)
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
        self.avatar_dir_path = settings.files.avatar_dir
        self.avatar_dir_path.mkdir(parents=True, exist_ok=True)
        self._ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png"}
        self._file_sizes = [64, 128, 256]
        self._file_max_size: int = 5 * 1024 * 1024

    async def update_profile_avatar(self, user_id: int, avatar: UploadFile) -> str:
        """
        1. Проверяем тип данных
        2. Создаем папку юзера
        4. Генерируем basename и сохраняем в БД (для дальнейшего получения)
        3. Сохраняем исходный файл в локальную папку
        5. Генерируем с помощью PIL различные форматы файла (64x64, 128x128, 256x256)
        Как фронтенду лучше всего указывать какой формат ему получать?

        Условия:
        - Некорректный тип файла: 400 -> Invalid file type
        - Лимит максимального размера: 400
        """
        valid_avatar = self._validate_photo(avatar)

        user_avatars_path = self.avatar_dir_path / str(user_id)
        user_avatars_path.mkdir(exist_ok=True, parents=True)

        basename = uuid.uuid4()
        file_path = user_avatars_path / f"{basename}.jpg"

        await self.profile_repository.update_one(
            update_data={"avatar_basename": f"static/avatars/{user_id}/{basename}"},
            user_id=user_id,
        )

        image_data = await valid_avatar.read()

        with open(file_path, "wb") as buffer:
            buffer.write(image_data)

        with Image.open(valid_avatar.file) as image:

            for size in self._file_sizes:
                image_copy = image.copy()
                image_copy.thumbnail((size, size))

                file_name = f"{basename}_{size}.jpg"
                file_path = user_avatars_path / file_name

                if image_copy.mode in ("RGBA", "P"):
                    image_copy = image_copy.convert("RGB")
                image_copy.save(file_path, format="JPEG")

        return str(basename)

    def _validate_photo(self, avatar: UploadFile) -> UploadFile:
        if avatar.content_type not in self._ALLOWED_AVATAR_TYPES:
            raise BadRequestException("Invalid file type. Use 'png' or 'jpeg'")
        if avatar.size > self._file_max_size:
            raise BadRequestException("File exceeds maximum size (5Mb)")
        return avatar


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


def get_avatar_service():
    return AvatarService(ProfileRepository)


def get_follower_service():
    return FollowerService(FollowerRepository, ProfileRepository)
