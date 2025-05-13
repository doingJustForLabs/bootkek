import uuid

from PIL import Image
from fastapi import UploadFile
from sqlalchemy import select, insert
from sqlalchemy.ext.asyncio import AsyncSession

from api.exceptions import NotFoundException, BadRequestException
from api.profiles.models import Profile
from api.profiles.schemas import ProfileCreateSchema
from core.config import settings


class ProfileRepository:
    @classmethod
    async def create_profile(
        cls, session: AsyncSession, user_id: int, profile_data: ProfileCreateSchema
    ) -> Profile:

        if not (profile_data.username and profile_data.name):
            raise BadRequestException("Поля 'name' и 'username' обязательные")

        if await cls.get_profile_by_user_id(session, user_id, not_found_error=False):
            raise BadRequestException("Профиль уже существует")

        if await cls.get_profile_by_username(
            session, profile_data.username, not_found_error=False
        ):
            raise BadRequestException("Данный юзернейм уже существует")

        data = {"user_id": user_id, **profile_data.model_dump()}
        profile = Profile(**data)

        session.add(profile)
        await session.commit()

        return profile

    @classmethod
    async def update_profile(
        cls, session: AsyncSession, user_id: int, update_data: ProfileCreateSchema
    ) -> Profile:

        profile: Profile = await session.scalar(
            select(Profile).where(Profile.user_id == user_id)
        )

        if not profile:
            raise NotFoundException("Профиль не найден")

        profile_by_username = await session.scalar(
            select(Profile).where(Profile.username == update_data.username)
        )

        if profile_by_username and profile.username != update_data.username:
            raise BadRequestException("Данный юзернейм уже существует")

        data = update_data.model_dump(exclude_none=True)

        if not data:
            raise BadRequestException("Пустой запрос")

        for key, value in data.items():
            if not getattr(profile, key):
                raise BadRequestException(f"Невалидный ключ для обновления: {key}")
            setattr(profile, key, value)

        await session.commit()
        await session.refresh(profile)
        return profile

    @classmethod
    async def get_profile_by_username(
        cls, session: AsyncSession, username: str, not_found_error: bool = False
    ) -> Profile:
        profile = await session.scalar(
            select(Profile).where(Profile.username == username)
        )
        if not profile and not_found_error:
            raise NotFoundException("Профиль не найден")
        return profile

    @classmethod
    async def get_profile_by_user_id(
        cls, session: AsyncSession, user_id: int, not_found_error: bool = False
    ) -> Profile:
        profile = await session.scalar(
            select(Profile).where(Profile.user_id == user_id)
        )
        if not profile and not_found_error:
            raise NotFoundException("Профиль не найден")
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
            raise BadRequestException(
                "Невалидный тип данных. Используйте 'png' или 'jpeg'"
            )
        if avatar.size > cls._FILE_MAX_SIZE:
            raise BadRequestException("Превышен размер файла (5Мб)")
        return avatar

    @classmethod
    def _create_dir(cls) -> None:
        cls._AVATAR_DIR_PATH.mkdir(parents=True, exist_ok=True)
