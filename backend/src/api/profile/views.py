from typing import Annotated, Optional

from authx import TokenPayload
from fastapi import APIRouter, Depends, HTTPException, status

from api.auth.views import http_bearer
from api.profile.schemas import ProfileSchema, ProfileSetupSchema
from api.profile.services import ProfileRepository
from database.db import DbSession
from utils import verify_access_token

router = APIRouter(
    tags=["Пользователи👨‍💻"], prefix="/profiles", dependencies=[Depends(http_bearer)]
)


@router.patch("/setup", response_model=ProfileSchema, response_model_exclude_none=True)
async def setup_user_profile(
    token: Annotated[TokenPayload, Depends(verify_access_token)],
    session: DbSession,
    profile_data: ProfileSchema,
):
    """Создание профиля пользователя (и его обновление)"""

    if not (profile_data.username and profile_data.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Обязательные поля отсутствуют (username, name)",
        )

    # user_orm = await ProfileRepository.get_profile_by_username(session, profile_data.username)
    # user = ProfileSchema.model_validate(user_orm)
    #
    # if user and user.is_required_complete:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST, detail="Данный никнейм занят"
    #     )
    #

    # if username:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST, detail="Данный никнейм занят"
    #     )

    # await ProfileRepository.create_and_update_profile(
    #     session, user_id=int(token.sub), profile_data=profile_data.model_dump()
    # )

    return profile_data


# @router.get("/search")
# async def search_profile(
#         token: Annotated[TokenPayload, Depends(verify_access_token)],
#         session: DbSession,
#         q: Optional[str] = None,
#         limit: int = 1000,
# ):
#     ...
#     return
#
#
# @router.get("/{user_id}", response_model=ProfileSchema)
# async def get_user_profile(
#         token: Annotated[TokenPayload, Depends(verify_access_token)],
#         user_id: int,
#         session: DbSession,
# ):
#     """Получаем информацию о пользователе"""
#     user_profile = await UserProfileRepository.get_profile_by_user_id(
#         session, int(user_id)
#     )
#     if not user_profile:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
#         )
#
#     return user_profile
#
#
# @router.put("/{user_id}", response_model=ProfileSchema)
# async def update_user_profile(
#         token: Annotated[TokenPayload, Depends(verify_access_token)],
#         user_id: int,
#         session: DbSession,
# ):
#     """Обновляем информацию о пользователе"""
#     profile = await UserProfileRepository.get_profile_by_user_id(session, int(user_id))
#
#     return profile
#
#
# @router.post("/{user_id}/avatar", response_model=ProfileSchema)
# async def set_profile_avatar(
#         token: Annotated[TokenPayload, Depends(verify_access_token)],
#         user_id: int,
#         session: DbSession,
# ):
#     profile = await UserProfileRepository.get_profile_by_user_id(session, int(user_id))
#
#     return profile
