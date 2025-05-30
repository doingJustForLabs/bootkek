from math import ceil

from fastapi import APIRouter, UploadFile, File

from api.dependencies import (
    AccessDependency,
    DbSession,
    BearerDependency,
    PaginationDependency,
)
from api.followers.services import FollowerRepository
from api.profiles.schemas import (
    ProfileCreateSchema,
    ProfileReadDetailSchema,
    ProfileResponseSchema,
    AvatarResponseSchema,
    ProfileResponseSearchSchema, ProfileReadSummarySchema,
)
from api.profiles.services import ProfileRepository, AvatarRepository
from api.search.schemas import SearchResponseSchema

router = APIRouter(tags=["Пользователи👨‍💻"], prefix="/profiles")


@router.post(
    "/me",
    response_model=ProfileResponseSchema,
    dependencies=[BearerDependency],
)
async def setup_user_profile(
    session: DbSession,
    token: AccessDependency,
    profile_data: ProfileCreateSchema,
):
    """Создание профиля пользователя"""
    profile = await ProfileRepository.create_profile(
        session, int(token.sub), profile_data
    )

    return ProfileResponseSchema(
        profile=ProfileReadDetailSchema.model_validate(profile)
    )


@router.patch(
    "/me",
    response_model=ProfileResponseSchema,
    dependencies=[BearerDependency],
)
async def update_user_profile(
    session: DbSession,
    token: AccessDependency,
    update_data: ProfileCreateSchema,
):
    """Обновление профиля пользователя"""
    profile = await ProfileRepository.update_profile(
        session, int(token.sub), update_data
    )

    return ProfileResponseSchema(
        profile=ProfileReadDetailSchema.model_validate(profile)
    )


@router.get(
    "/me",
    response_model=ProfileResponseSchema,
    dependencies=[BearerDependency],
)
async def get_user_profile(
    token: AccessDependency,
    session: DbSession,
):
    """Получение данных о пользователе"""
    profile = await ProfileRepository.get_profile_by_user_id(
        session, int(token.sub), not_found_error=True
    )

    return ProfileResponseSchema(
        profile=ProfileReadDetailSchema.model_validate(profile)
    )


@router.post(
    "/avatars", dependencies=[BearerDependency], response_model=AvatarResponseSchema
)
async def update_user_avatar(
    token: AccessDependency,
    session: DbSession,
    avatar: UploadFile = File(...),
):
    """
    Создание аватарки пользователя

    Чтобы получить аватарку необходимо отправить запрос на `/static/avatars/1/basename.jpg`
    """
    basename = await AvatarRepository.update_profile_avatar(
        session, int(token.sub), avatar
    )
    return AvatarResponseSchema(basename=basename)


@router.get(
    "/{user_id}",
    dependencies=[BearerDependency],
)
async def get_user_profile_by_user_id(
    token: AccessDependency,
    user_id: int,
    session: DbSession,
):
    """Получение данных о пользователе по user_id"""
    profile = await ProfileRepository.get_profile_by_user_id(
        session, user_id, not_found_error=True
    )

    is_following = await FollowerRepository.is_following(
        session, int(token.sub), user_id
    )

    return ProfileResponseSearchSchema(
        profile=ProfileReadDetailSchema.model_validate(profile),
        is_current_user=int(token.sub) == user_id,
        is_following=is_following,
    )


@router.get("", response_model=SearchResponseSchema)
async def get_all_users(session: DbSession, pagination: PaginationDependency):
    """Получение данных о пользователях (скоро перестанет поддерживаться)"""
    count = await ProfileRepository.get_count_profiles(session)
    profiles = await ProfileRepository.get_all_profiles(session, pagination)

    return SearchResponseSchema(
        profiles=[ProfileReadSummarySchema.model_validate(profile) for profile in profiles],
        pagination=pagination,
        total_profiles=count,
        total_pages=ceil(count / pagination.limit),
    )
