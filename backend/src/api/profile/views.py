from typing import Annotated, Optional

from authx import TokenPayload
from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from api.auth.views import http_bearer
from api.profile.schemas import ProfileSchema
from api.profile.services import ProfileRepository
from database.db import DbSession
from utils import verify_access_token, verify_fresh_token

router = APIRouter(tags=["Пользователи👨‍💻"], prefix="/users")


@router.patch("/me", dependencies=[Depends(http_bearer)])
async def setup_user_profile(
    token: Annotated[TokenPayload, Depends(verify_fresh_token)],
    session: DbSession,
    profile_data: ProfileSchema,
):
    """Создание профиля пользователя"""

    profile = await ProfileRepository.get_profile_by_username(
        session, username=profile_data.username
    )

    if profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username is already used"
        )

    await ProfileRepository.create_profile(session, int(token.sub), profile_data)

    return {"detail": "Success setup"}


@router.get("/me", dependencies=[Depends(http_bearer)])
async def get_user_profile(
    token: Annotated[TokenPayload, Depends(verify_access_token)],
    session: DbSession,
):
    """Получение данных о пользователе"""
    user = await ProfileRepository.get_profile_by_user_id(session, int(token.sub))
    return user


@router.get("/search", dependencies=[Depends(http_bearer)])
async def search_profile(
    token: Annotated[TokenPayload, Depends(verify_access_token)],
    session: DbSession,
    q: Optional[str] = None,
    limit: int = 100,
):
    """Поиск пользователя (по юзернейму, тегам, чему угодно)"""
    return await ProfileRepository.get_profiles(session)


@router.get("")
async def get_all_profiles(session: DbSession):
    """Получаем информацию о всех пользователях"""
    user_profile = await ProfileRepository.get_profiles(session)

    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return user_profile


@router.get("/{user_id}")
async def get_user_profile(
    user_id: int,
    session: DbSession,
):
    """Получаем информацию о пользователе"""
    user_profile = await ProfileRepository.get_profile_by_user_id(session, int(user_id))

    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    return user_profile
