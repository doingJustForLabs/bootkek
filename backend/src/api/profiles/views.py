import os
import uuid
from pathlib import Path
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from starlette.responses import FileResponse

from api.auth.dependency import TokenDependency
from api.auth.views import http_bearer
from api.profiles.schemas import ProfileSchema
from api.profiles.services import get_profile_service, ProfileService

router = APIRouter(tags=["Пользователи👨‍💻"], prefix="/profiles")

AVATAR_DIR = Path("static/avatars")
AVATAR_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png"}


@router.patch("/me", dependencies=[Depends(http_bearer)])
async def setup_user_profile(
    token: TokenDependency,
    profile_data: ProfileSchema,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """Создание и обновление профиля пользователя"""

    profile = await profile_service.get_profile_by_user_id(int(token.sub))

    if profile:
        update_data = profile_data.model_dump(exclude_unset=True)
        await profile_service.update_profile(int(token.sub), update_data)

    else:

        if not (profile_data.username or profile_data.name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Both 'name' and 'username' are required for profiles creation.",
            )

        await profile_service.create_profile(int(token.sub), profile_data)

    return {"detail": "Profile Updated", "profile": profile_data}


@router.get("/me", dependencies=[Depends(http_bearer)])
async def get_user_profile(
    token: TokenDependency,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """Получение данных о пользователе"""
    profile = await profile_service.get_profile_by_user_id(int(token.sub))

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_425_TOO_EARLY, detail="User profile didn't created"
        )
    return profile


@router.post("/avatar", dependencies=[Depends(http_bearer)])
async def update_user_avatar(
    token: TokenDependency,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
    avatar: UploadFile = File(...),
):
    """Подгружаем аватарку пользователя"""
    try:
        if avatar.content_type not in ALLOWED_AVATAR_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type"
            )

        profile = await profile_service.get_profile_by_user_id(int(token.sub))

        if profile.avatar_url != "static/avatar/default-avatar.jpg":
            old_file = AVATAR_DIR / Path(str(profile.avatar_url)).name
            os.remove(old_file)
            if old_file.exists():
                os.remove(old_file)

        file_name = f"{uuid.uuid4()}.jpg"
        file_path = AVATAR_DIR / file_name

        with open(file_path, "wb") as buffer:
            buffer.write(await avatar.read())

        avatar_url = f"/static/avatars/{file_name}"
        await profile_service.update_profile_avatar(int(token.sub), avatar_url)

        return {"detail": "Avatar uploaded successfully", "avatar_url": avatar_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=e)


@router.get("/avatar/{file_name}", dependencies=[Depends(http_bearer)])
async def get_user_avatar(filename: str):
    """Получаем аватарку пользователя"""

    if ".jpg" not in filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bad filename")

    file_path = AVATAR_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avatar not found")

    return FileResponse(file_path)


@router.get("/search", dependencies=[Depends(http_bearer)])
async def search_profile(
    token: TokenDependency,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
    q: Optional[str] = None,
    limit: int = 100,
):
    """Поиск пользователя (по юзернейму, тегам, чему угодно)"""

    filters = {...}

    # profiles = await profile_service.get_profiles(filters)
    return ...


@router.get("")
async def get_all_profiles(
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """Получаем информацию о всех пользователях"""

    profile = await profile_service.get_profiles()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Users not found"
        )

    return profile


@router.get("/{user_id}")
async def get_user_profile(
    user_id: int,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """Получаем информацию о пользователе"""
    profile = await profile_service.get_profile_by_user_id(user_id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден"
        )

    return profile
