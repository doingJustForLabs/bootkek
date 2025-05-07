import uuid

from fastapi import UploadFile, status
from sqlalchemy import select, insert
from sqlalchemy.ext.asyncio import AsyncSession
from PIL import Image

from api.exceptions import NotFoundException, BadRequestException
from api.profiles.models import Profile
from api.profiles.schemas import ProfileCreateSchema
from core.config import settings


class ProfileRepository:
    @classmethod
    async def create_profile(
        cls, session: AsyncSession, user_id: int, profile_data: ProfileCreateSchema
    ) -> Profile:
        if await session.scalar(select(Profile).where(Profile.user_id == user_id)):
            raise BadRequestException("Profile already exists")

        if await session.scalar(select(Profile).where(Profile.username == profile_data.username)):
            raise BadRequestException("Username already used")

        data = {"user_id": user_id, **profile_data.model_dump()}

        stmt = insert(Profile).values(**data).returning(Profile)
        res = await session.execute(stmt)

        await session.commit()
        return res.scalar_one()

    @classmethod
    async def update_profile(
        cls, session: AsyncSession, user_id: int, update_data: ProfileCreateSchema
    ) -> Profile:
        profile = await cls.get_profile_by_user_id(session, user_id)

        profile_by_username = await cls.get_profile_by_username(
            session, update_data.username
        )
        if profile_by_username and profile.username != update_data.username:
            raise BadRequestException("Username already used")

        data = update_data.model_dump(exclude_none=True)

        if not data:
            raise BadRequestException("Empty data")

        for key, value in data.items():
            if key not in profile:
                raise BadRequestException(f"Invalid key for update: {key}")
            setattr(profile, key, value)

        await session.commit()
        await session.refresh(profile)
        return profile

    @classmethod
    async def get_profile_by_username(
        cls, session: AsyncSession, username: str
    ) -> Profile:
        profile = await session.scalar(
            select(Profile).where(Profile.username == username)
        )
        if not profile:
            raise NotFoundException("Profile not found")
        return profile

    @classmethod
    async def get_profile_by_user_id(
        cls, session: AsyncSession, user_id: int
    ) -> Profile:
        profile = await session.scalar(
            select(Profile).where(Profile.user_id == user_id)
        )
        if not profile:
            raise NotFoundException("Profile not found")
        return profile


class AvatarRepository:
    _AVATAR_DIR_PATH = settings.files.avatar_dir
    _ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png"}
    _FILE_MAX_SIZE = 5 * 1024 * 1024 * 8
    _FILE_SIZES = [64, 128, 256]

    @classmethod
    async def update_profile_avatar(
        cls, session: AsyncSession, user_id: int, avatar: UploadFile
    ) -> str:
        """
        1. Проверяем тип данных
        2. Создаем папку юзера
        4. Генерируем basename и сохраняем в БД (для дальнейшего получения)
        3. Сохраняем исходный файл в локальную папку
        5. Генерируем с помощью PIL различные форматы файла (64x64, 128x128, 256x256)
        """

        valid_avatar = cls._validate_photo(avatar)
        cls._create_dir()

        user_avatars_path = cls._AVATAR_DIR_PATH / str(user_id)
        user_avatars_path.mkdir(exist_ok=True, parents=True)

        basename = uuid.uuid4()
        file_path = user_avatars_path / f"{basename}.jpg"

        profile = await ProfileRepository.get_profile_by_user_id(session, user_id)
        profile.avatar_basename = f"static/avatars/{user_id}/{basename}"

        await session.commit()
        await session.refresh(profile)

        image_data = await valid_avatar.read()

        with open(file_path, "wb") as buffer:
            buffer.write(image_data)

        with Image.open(valid_avatar.file) as image:
            for size in cls._FILE_SIZES:
                image_copy = image.copy()
                image_copy.thumbnail((size, size))

                file_name = f"{basename}_{size}.jpg"
                file_path = user_avatars_path / file_name

                if image_copy.mode in ("RGBA", "P"):
                    image_copy = image_copy.convert("RGB")
                image_copy.save(file_path, format="JPEG")

        return str(basename)

    @classmethod
    def _validate_photo(cls, avatar: UploadFile) -> UploadFile:
        if avatar.content_type not in cls._ALLOWED_AVATAR_TYPES:
            raise BadRequestException("Invalid file type. Use 'png' or 'jpeg'")
        if avatar.size > cls._FILE_MAX_SIZE:
            raise BadRequestException("File exceeds maximum size (5Mb)")
        return avatar

    @classmethod
    def _create_dir(cls) -> None:
        cls._AVATAR_DIR_PATH.mkdir(parents=True, exist_ok=True)
