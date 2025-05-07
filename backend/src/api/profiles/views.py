from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from api.auth.views import http_bearer, AccessDependency
from api.profiles.schemas import (
    ProfileCreateSchema,
    ProfileDetailResponseSchema,
    ProfileDetailDataSchema,
    ProfileSummaryDataSchema,
    SearchResponseSchema,
    SearchParams,
    PaginationSchema,
    SearchFilters,
)
from api.profiles.services import ProfileRepository, AvatarRepository
from api.search.service import SearchService, get_search_service
from database.db import DbSession

router = APIRouter(
    tags=["Пользователи👨‍💻"], prefix="/profiles", dependencies=[Depends(http_bearer)]
)


@router.post(
    "/me",
    response_model=ProfileDetailResponseSchema,
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
)
async def get_user_profile(
    token: AccessDependency,
    session: DbSession,
):
    """Получение данных о пользователе"""
    profile = await ProfileRepository.get_profile_by_user_id(session, int(token.sub))

    return ProfileDetailResponseSchema(
        profile=ProfileDetailDataSchema.model_validate(profile)
    )


@router.post("/avatars")
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


# # @router.get(
# #     "/search", dependencies=[Depends(http_bearer)], response_model=SearchResponseSchema
# # )
# # async def search_some_profiles(
# #     profile_service: Annotated[ProfileService, Depends(get_profile_service)],
# #     params: Annotated[SearchParams, Depends()],
# #     pagination: Annotated[PaginationSchema, Depends(PaginationSchema)],
# # ):
# #     """Поиск пользователя (по юзернейму, тегам, чему угодно)"""
# #     try:
# #         profiles = await profile_service.search_profiles(
# #             q=params.q,
# #             limit=int(pagination.limit),
# #             page=int(pagination.page),
# #             order_by=params.order_by,
# #             desc=params.desc,
# #         )
# #
# #         validated_profiles = [
# #             ProfileSummaryDataSchema.model_validate(profile) for profile in profiles
# #         ]
# #
# #         return SearchResponseSchema(
# #             profiles=validated_profiles,
# #             filters=SearchParams.model_validate(params),
# #             pagination=pagination,
# #         )
# #
# #     except ValueError as e:
# #         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
#
#
# # @router.get("/search")
# # async def search_profiles(
# #     filters: Annotated[SearchFilters, Depends()],
# #     pagination: Annotated[PaginationSchema, Depends()],
# #     search_service: Annotated[SearchService, Depends(get_search_service)],
# # ):
# #     profiles = await search_service.search_profiles(pagination, filters)
# #
# #     return profiles
