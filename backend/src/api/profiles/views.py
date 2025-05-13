from fastapi import APIRouter, Depends, UploadFile, File

from fastapi import APIRouter, Depends, UploadFile, File

from api.auth.views import http_bearer, AccessDependency
from api.profiles.schemas import (
    ProfileCreateSchema,
    ProfileDetailResponseSchema,
    ProfileDetailDataSchema,
)
from api.profiles.services import ProfileRepository, AvatarRepository

# from api.search.service import SearchService, get_search_service
from database.db import DbSession

router = APIRouter(tags=["Пользователи👨‍💻"], prefix="/profiles")


@router.post(
    "/me",
    response_model=ProfileDetailResponseSchema,
    dependencies=[Depends(http_bearer)],
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

    return ProfileDetailResponseSchema(
        profile=ProfileDetailDataSchema.model_validate(profile)
    )


@router.patch(
    "/me",
    response_model=ProfileDetailResponseSchema,
    dependencies=[Depends(http_bearer)],
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

    return ProfileDetailResponseSchema(
        profile=ProfileDetailDataSchema.model_validate(profile)
    )


@router.get(
    "/me",
    response_model=ProfileDetailResponseSchema,
    dependencies=[Depends(http_bearer)],
)
async def get_user_profile(
    token: AccessDependency,
    session: DbSession,
):
    """Получение данных о пользователе"""
    profile = await ProfileRepository.get_profile_by_user_id(
        session, int(token.sub), not_found_error=True
    )

    return ProfileDetailResponseSchema(
        profile=ProfileDetailDataSchema.model_validate(profile)
    )


@router.post("/avatars", dependencies=[Depends(http_bearer)])
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
    return {"basename": basename}


# @router.get(
#     "/{username}",
#     response_model=ProfileDetailResponseSchema,
# )
# async def get_user_profile_by_username(
#     username: str,
#     session: DbSession,
# ):
#     """Получение данных о пользователе по username"""
#     profile = await ProfileRepository.get_profile_by_username(
#         session, username, not_found_error=True
#     )
#
#     return ProfileDetailResponseSchema(
#         profile=ProfileDetailDataSchema.model_validate(profile)
#     )


@router.get(
    "/{user_id}",
    response_model=ProfileDetailResponseSchema,
    dependencies=[Depends(http_bearer)]
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

    return ProfileDetailResponseSchema(
        profile=ProfileDetailDataSchema.model_validate(profile),
        is_current_user=int(token.sub) == user_id
    )


@router.get("")
async def get_all_users(session: DbSession):
    """Получение данных о пользователях"""
    profiles = await ProfileRepository.get_all_profiles(session)
    return profiles
