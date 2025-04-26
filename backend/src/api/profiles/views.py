from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse

from api.auth.views import http_bearer, AccessDependency
from api.enums import FileSize
from api.profiles.schemas import (
    ProfileCreateSchema,
    ProfileDetailResponseSchema,
    ProfileDetailDataSchema,
    ProfileSummaryDataSchema,
    SearchResponseSchema,
    SearchParams, PaginationSchema,
)
from api.profiles.services import (
    ProfileService,
    AvatarService,
    FollowerService,
    get_profile_service,
    get_avatar_service,
    get_follower_service,
)

router = APIRouter(
    tags=["Пользователи👨‍💻"], prefix="/profiles", dependencies=[Depends(http_bearer)]
)


@router.post(
    "/me",
    response_model=ProfileDetailResponseSchema,
)
async def setup_user_profile(
    token: AccessDependency,
    profile_data: ProfileCreateSchema,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """Создание профиля пользователя"""
    profile = await profile_service.create_profile(int(token.sub), profile_data)

    return ProfileDetailResponseSchema(
        profile=ProfileDetailDataSchema.model_validate(profile)
    )


@router.patch(
    "/me",
    response_model=ProfileDetailResponseSchema,
)
async def update_user_profile(
    token: AccessDependency,
    update_data: ProfileCreateSchema,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """Обновление профиля пользователя"""
    updated_profile = await profile_service.update_profile(int(token.sub), update_data)

    return ProfileDetailResponseSchema(
        profile=ProfileDetailDataSchema.model_validate(updated_profile)
    )


@router.get(
    "/me",
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
#

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


@router.post("/avatars")
async def update_user_avatar(
    token: AccessDependency,
    avatar_service: Annotated[AvatarService, Depends(get_avatar_service)],
    avatar: UploadFile = File(...),
):
    """
    Создание аватарки пользователя

    Чтобы получить аватарку необходимо отправить запрос на `/static/avatars/1/basename.jpg`
    """
    basename = await avatar_service.update_profile_avatar(int(token.sub), avatar)
    return {"basename": basename}


@router.post("/followers/{target_id}")
async def follow_user(
    token: AccessDependency,
    target_id: int,
):
    """Пользователь подписывается на другого"""
    return ...




# @router.post("/followers/{followee_id}")
# async def follow_user(
#     token: AccessDependency,
#     followee_id: int,
#     follower_service: Annotated[FollowerService, Depends(get_follower_service)],
# ):
#     follower = await follower_service.follow_user(
#         follower_id=int(token.sub), followee_id=followee_id
#     )
#
#     if not follower:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST, detail="User cannot follow himself"
#         )
#
#     return follower
