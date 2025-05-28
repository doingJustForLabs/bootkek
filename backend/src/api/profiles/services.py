import uuid

from PIL import Image
from fastapi import UploadFile
from sqlalchemy import select, insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.functions import func

from api.exceptions import NotFoundException, BadRequestException
from api.profiles.models import Profile
from api.profiles.schemas import ProfileCreateSchema
from api.search.schemas import PaginationSchema
from api.skills.services import UserSkillsRepository
from api.skills.models import UsersSkill, Skills
from core.config import settings


class ProfileRepository:
    @classmethod
    async def create_profile(
        cls, session: AsyncSession, user_id: int, profile_data: ProfileCreateSchema
    ) -> Profile:
        if not (profile_data.username and profile_data.name):
            raise BadRequestException("Поля 'name' и 'username' обязательные")

        # Проверка, существует ли уже профиль
        if await cls.get_profile_by_user_id(session, user_id, not_found_error=False):
            raise BadRequestException("Профиль уже существует")

        # Проверка уникальности юзернейма
        if await cls.get_profile_by_username(
            session, profile_data.username, not_found_error=False
        ):
            raise BadRequestException("Данный юзернейм уже существует")

        # Обработка навыков
        user_skills: list[UsersSkill] = []
        if profile_data.skills:
            # Получаем объекты Skills по названиям
            result = await session.execute(
                select(Skills).where(Skills.skill_name.in_(profile_data.skills))
            )
            found_skills: list[Skills] = list(result.scalars().all())

            if not found_skills:
                raise BadRequestException("Переданные навыки не найдены в базе данных")

            found_names = {skill.skill_name for skill in found_skills}
            not_found = set(profile_data.skills) - found_names
            if not_found:
                raise BadRequestException(
                    f"Следующие навыки не найдены в базе данных: {', '.join(not_found)}"
                )

            # Создаём UsersSkill объекты (но без user_id)
            user_skills = [UsersSkill(skill_id=skill.id) for skill in found_skills]

        # Создание объекта профиля и прикрепление skills через relationship
        profile = Profile(
            user_id=user_id,
            course=profile_data.course,
            faculty=profile_data.faculty,
            sex=profile_data.sex,
            username=profile_data.username,
            name=profile_data.name,
            skills=user_skills,  # сюда кладутся UsersSkill
        )

        session.add(profile)
        await session.commit()

        await session.refresh(profile, attribute_names=["skills"])
        return profile

    @classmethod
    async def update_profile(
        cls, session: AsyncSession, user_id: int, update_data: ProfileCreateSchema
    ) -> Profile:

        profile: Profile = await session.scalar(
            select(Profile)
            .where(Profile.user_id == user_id)
            .options(selectinload(Profile.skills).selectinload(UsersSkill.skill))
        )

        if not profile:
            raise NotFoundException("Профиль не найден")

        profile_by_username = await session.scalar(
            select(Profile).where(Profile.username == update_data.username)
        )

        if profile_by_username and profile.username != update_data.username:
            raise BadRequestException("Данный юзернейм уже существует")

        data = update_data.model_dump(exclude_none=True, exclude={"skills"})

        if not data and update_data.skills is None:
            raise BadRequestException("Пустой запрос")

        for key, value in data.items():
            if not hasattr(profile, key):
                raise BadRequestException(f"Невалидный ключ для обновления: {key}")
            setattr(profile, key, value)

        # Обновляем навыки
        if update_data.skills is not None:
            result = await session.execute(
                select(Skills).where(Skills.skill_name.in_(update_data.skills))
            )
            found_skills = result.scalars().all()
            found_skill_names = {s.skill_name for s in found_skills}
            not_found = set(update_data.skills) - found_skill_names

            if not_found:
                raise BadRequestException(
                    f"Следующие предметы не найдены в базе данных: {', '.join(not_found)}"
                )

            profile.skills = [UsersSkill(skill_id=skill.id) for skill in found_skills]

        await session.commit()
        await session.refresh(profile)
        return profile

    @classmethod
    async def get_profile_by_username(
        cls, session: AsyncSession, username: str, not_found_error: bool = False
    ) -> Profile:
        profile = await session.scalar(
            select(Profile)
            .where(Profile.username == username)
            .options(
                selectinload(Profile.skills).selectinload(UsersSkill.skill),
            )
        )

        if not profile and not_found_error:
            raise NotFoundException("Профиль не найден")
        return profile

    @classmethod
    async def get_profile_by_user_id(
        cls, session: AsyncSession, user_id: int, not_found_error: bool = False
    ) -> Profile:
        profile = await session.scalar(
            select(Profile)
            .where(Profile.user_id == user_id)
            .options(
                selectinload(Profile.skills).selectinload(UsersSkill.skill),
            )
        )

        if not profile and not_found_error:
            raise NotFoundException("Профиль не найден")
        return profile

    @classmethod
    async def get_all_profiles(
        cls,
        session: AsyncSession,
        pagination: PaginationSchema,
    ):
        query = (
            select(Profile)
            .order_by(Profile.user_id)
            .offset(pagination.limit * (pagination.page - 1))
            .limit(pagination.limit)
        )

        profiles = await session.scalars(query)

        if not profiles:
            raise NotFoundException("Профили не найдены")

        return profiles.all()

    @classmethod
    async def get_count_profiles(cls, session: AsyncSession) -> int:
        query = select(func.count()).select_from(Profile)
        res = await session.execute(query)
        return res.scalar_one()


class AvatarRepository:
    _AVATAR_DIR_PATH = settings.files.avatar_dir
    _ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png"}
    _FILE_MAX_SIZE = 200 * 1024 * 8
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
        if avatar.size and avatar.size > cls._FILE_MAX_SIZE:
            raise BadRequestException("Превышен размер файла (5Мб)")
        return avatar

    @classmethod
    def _create_dir(cls) -> None:
        cls._AVATAR_DIR_PATH.mkdir(parents=True, exist_ok=True)
