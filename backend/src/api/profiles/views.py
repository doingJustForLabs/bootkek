from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse

from api.auth.views import http_bearer, AccessDependency
from api.exceptions import BadRequestException
from api.profiles.enums import FileSize
from api.profiles.schemas import (
    ProfileCreateSchema,
    SearchParams,
    ProfileDetailResponseSchema,
    ProfileDetailDataSchema,
    SearchResponseSchema,
    ProfileSummaryDataSchema,
    PaginationSchema,
)
from api.profiles.services import (
    ProfileService,
    AvatarService,
    FollowerService,
    get_profile_service,
    get_avatar_service,
    get_follower_service,
)
from core.config import settings

router = APIRouter(tags=["Пользователи👨‍💻"], prefix="/profiles")

# AVATAR_DIR = Path(settings.files.static_dir / "avatars")
# AVATAR_DIR.mkdir(parents=True, exist_ok=True)
# ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png"}
#
# file_sizes = [64, 128, 256]


@router.post(
    "/me",
    dependencies=[Depends(http_bearer)],
    response_model=ProfileDetailResponseSchema,
)
async def setup_user_profile(
    token: AccessDependency,
    profile_data: ProfileCreateSchema,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """
    Создание профиля пользователя

    :param

        token (TokenDependency): Зависимость заголовка с авторизацией
        profile_data (ProfileSchema): Поля профиля

            name (str, required): Имя пользователя (возможно с фамилией)
            username (str, required): Юзернейм пользователя (уникальный идентификатор)

            course (int): Курс пользователя
            sex (str): Пол пользователя (мужской, женский, другой)
            faculty (str): Факультет пользователя

    :returns

        profile: Созданный профиль

    :exception

        Если профиль существует -> 400 Ошибка
    """
    profile = await profile_service.create_profile(int(token.sub), profile_data)

    return ProfileDetailResponseSchema(
        profile=ProfileDetailDataSchema.model_validate(profile)
    )


@router.patch(
    "/me",
    dependencies=[Depends(http_bearer)],
    response_model=ProfileDetailResponseSchema,
)
async def update_user_profile(
    token: AccessDependency,
    update_data: ProfileCreateSchema,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """
    Обновление профиля пользователя

    :param

        token (TokenDependency): Зависимость заголовка с авторизацией
        profile_data (ProfileSchema): Поля профиля

            name (str, required): Имя пользователя (возможно с фамилией)
            username (str, required): Юзернейм пользователя (уникальный идентификатор)

            course (int): Курс пользователя
            sex (str): Пол пользователя (мужской, женский, другой)
            faculty (str): Факультет пользователя

    :returns

        profile: Созданный профиль

    :exception

        Если профиль не существует -> 404 Ошибка
    """
    updated_profile = await profile_service.update_profile(int(token.sub), update_data)

    return ProfileDetailResponseSchema(
        profile=ProfileDetailDataSchema.model_validate(updated_profile)
    )


@router.get(
    "/me",
    dependencies=[Depends(http_bearer)],
    response_model=ProfileDetailResponseSchema,
)
async def get_user_profile(
    token: AccessDependency,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """Получение данных о пользователе"""
    profile = await profile_service.read_profile(int(token.sub))

    return ProfileDetailResponseSchema(
        profile=ProfileDetailDataSchema.model_validate(profile)
    )


@router.get("")
async def get_all_profiles(
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """Получаем информацию о всех пользователях"""
    profiles = await profile_service.get_profiles()
    return {"profiles": profiles}


@router.get("/{user_id}", response_model=ProfileDetailResponseSchema)
async def get_user_profile(
    user_id: int,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """Получаем информацию о пользователе"""
    profile = await profile_service.get_profile_by_user_id(user_id)
    return ProfileDetailResponseSchema(
        profile=ProfileDetailDataSchema.model_validate(profile)
    )


@router.post("/avatars", dependencies=[Depends(http_bearer)])
async def update_user_avatar(
    token: AccessDependency,
    avatar_service: Annotated[AvatarService, Depends(get_avatar_service)],
    avatar: UploadFile = File(...),
):
    """Создание аватарки пользователя"""

    # TODO png формат не принимается, решить проблему

    basename = await avatar_service.update_profile_avatar(int(token.sub), avatar)
    return {"basename": basename}


@router.get("/avatars/{basename}", dependencies=[Depends(http_bearer)])
async def get_user_avatar(
    basename: str,
    file_size: FileSize,
    avatar_service: Annotated[AvatarService, Depends(get_avatar_service)],
) -> FileResponse:
    """Запрос на получение аватарки пользователя по basename (сгенерированному имени аватарки без размера)

    :arg
        basename (str): Сгенерированное имя аватарки без размера (лежит у пользователя в avatar_basename)
        file_size: (Enum(FileSize)): Размер аватарки (в данной версии это 64x64, 128x128, 256x256)

    :returns
        FileResponse: Файл
    """
    avatar = await avatar_service.get_profile_avatar(basename, file_size)
    return avatar


# @router.get(
#     "/search", dependencies=[Depends(http_bearer)], response_model=SearchResponseSchema
# )
# async def search_some_profiles(
#     profile_service: Annotated[ProfileService, Depends(get_profile_service)],
#     params: Annotated[SearchParams, Depends()],
#     pagination: Annotated[PaginationSchema, Depends(PaginationSchema)],
# ):
#     """Поиск пользователя (по юзернейму, тегам, чему угодно)"""
#     try:
#         profiles = await profile_service.search_profiles(
#             q=params.q,
#             limit=int(pagination.limit),
#             page=int(pagination.page),
#             order_by=params.order_by,
#             desc=params.desc,
#         )
#
#         validated_profiles = [
#             ProfileSummaryDataSchema.model_validate(profile) for profile in profiles
#         ]
#
#         return SearchResponseSchema(
#             profiles=validated_profiles,
#             filters=SearchParams.model_validate(params),
#             pagination=pagination,
#         )
#
#     except ValueError as e:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/followers/{followee_id}", dependencies=[Depends(http_bearer)])
async def follow_user(
    token: AccessDependency,
    followee_id: int,
    follower_service: Annotated[FollowerService, Depends(get_follower_service)],
):
    follower = await follower_service.follow_user(
        follower_id=int(token.sub), followee_id=followee_id
    )

    if not follower:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User cannot follow himself"
        )

    return follower
