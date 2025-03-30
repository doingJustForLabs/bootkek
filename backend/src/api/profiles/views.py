from typing import Annotated, Optional

from authx import TokenPayload
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from api.auth.dependency import TokenDependency
from api.auth.views import http_bearer
from api.profiles.schemas import ProfileSchema
from api.profiles.services import ProfileRepository
from core.db import DbSession
from utils import verify_access_token

router = APIRouter(tags=["Пользователи👨‍💻"], prefix="/profiles")


@router.patch("", dependencies=[Depends(http_bearer)])
async def setup_user_profile(
    token: TokenDependency,
    session: DbSession,
    profile_data: ProfileSchema,
):
    """Создание и обновление профиля пользователя"""

    profile = await ProfileRepository.get_profile_by_user_id(session, int(token.sub))

    if profile:
        update_data = profile_data.model_dump(exclude_unset=True)
        await ProfileRepository.update_profile(session, profile, update_data)

    else:
        if not (profile_data.username or profile_data.name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Both 'name' and 'username' are required for profiles creation.",
            )

        await ProfileRepository.create_profile(session, int(token.sub), profile_data)

    return {"detail": "Success"}


@router.get("", dependencies=[Depends(http_bearer)])
async def get_user_profile(
    token: TokenDependency,
    session: DbSession,
):
    """Получение данных о пользователе"""
    user = await ProfileRepository.get_profile_by_user_id(session, int(token.sub))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_425_TOO_EARLY, detail="User profile didn't created"
        )

    return user


@router.post("/avatar", dependencies=[Depends(http_bearer)])
async def update_user_avatar(
    token: TokenDependency,
    avatar: UploadFile = File(...)
):
    """Подгружаем аватарку пользователя"""

    return {"user": token.sub, "avatar": avatar.file}


@router.get("/avatar/{avatar_id}", dependencies=[Depends(http_bearer)])
async def get_user_avatar(
    token: TokenDependency,
    avatar_id: int
):
    """Получаем аватарку пользователя"""

    return ...


@router.get("/search", dependencies=[Depends(http_bearer)])
async def search_profile(
    token: Annotated[TokenPayload, Depends(verify_access_token)],
    session: DbSession,
    q: Optional[str] = None,
    limit: int = 100
):
    """Поиск пользователя (по юзернейму, тегам, чему угодно)"""
    return await ProfileRepository.get_profiles(session)


# @router.get("")
# async def get_all_profiles(session: DbSession):
#     """Получаем информацию о всех пользователях"""
#     users = await ProfileRepository.get_profiles(session)
#
#     if not users:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="Users not found"
#         )
#
#     return users
#
#
# @router.get("/{user_id}")
# async def get_user_profile(
#     user_id: int,
#     session: DbSession,
# ):
#     """Получаем информацию о пользователе"""
#     user_profile = await ProfileRepository.get_profile_by_user_id(session, int(user_id))
#
#     if not user_profile:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
#         )
#
#     return user_profile
