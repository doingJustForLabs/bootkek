from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from starlette.responses import FileResponse
from PIL import Image

from api.auth.dependency import AccessDependency
from api.auth.views import http_bearer
from api.profiles.schemas import ProfileSchema, SearchParams, FileSize
from api.profiles.services import get_profile_service, ProfileService
from core.config import settings

import uuid
from io import BytesIO
from pathlib import Path
from typing import Annotated


router = APIRouter(tags=["Пользователи👨‍💻"], prefix="/profiles")

AVATAR_DIR = Path(settings.files.static_dir / "avatars")
AVATAR_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png"}

file_sizes = [64, 128, 256]


@router.post("/me", dependencies=[Depends(http_bearer)])
async def setup_user_profile(
    token: AccessDependency,
    profile_data: ProfileSchema,
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

        Если профиль существует -> 409 Ошибка - Конфликт
    """

    profile = await profile_service.get_profile_by_user_id(int(token.sub))

    if profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Profile is already created"
        )

    if not (profile_data.username or profile_data.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both 'name' and 'username' are required for profiles creation.",
        )

    profile = await profile_service.create_profile(int(token.sub), profile_data)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already used"
        )

    return {"profile": profile_data}


@router.patch("/me", dependencies=[Depends(http_bearer)])
async def update_user_profile(
    token: AccessDependency,
    update_data: ProfileSchema,
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

    profile = await profile_service.get_profile_by_user_id(int(token.sub))

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
        )

    updated_profile = await profile_service.update_profile(int(token.sub), update_data)

    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already used"
        )

    return {"profile": updated_profile}


@router.get("/me", dependencies=[Depends(http_bearer)])
async def get_user_profile(
    token: AccessDependency,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """Получение данных о пользователе"""
    profile = await profile_service.get_profile_by_user_id(int(token.sub))

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_425_TOO_EARLY, detail="User profile didn't created"
        )
    return profile


@router.post("/avatars", dependencies=[Depends(http_bearer)])
async def update_user_avatar(
    token: AccessDependency,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
    avatar: UploadFile = File(...),
):
    """Создание аватарки пользователя"""

    if avatar.content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type"
        )

    basename = f"{uuid.uuid4()}"
    file_path = AVATAR_DIR / f"{basename}.jpg"

    with open(f"{file_path}.jpg", "wb") as buffer:
        buffer.write(image_data := await avatar.read())

    image = Image.open(BytesIO(image_data))

    await profile_service.update_profile_avatar(int(token.sub), basename)

    avatar_urls = {}

    for size in file_sizes:
        image_copy = image.copy()
        image_copy.thumbnail((size, size))

        file_name = f"{basename}_{size}.jpg"
        file_path = AVATAR_DIR / file_name

        image_copy.convert("RGB")
        image_copy.save(file_path, format="JPEG")

        avatar_url = f"/static/avatars/{file_name}"
        avatar_urls.update({size: avatar_url})

    return {"basename": basename}


@router.get("/avatars/{basename}", dependencies=[Depends(http_bearer)])
async def get_user_avatar(basename: str, file_size: FileSize):
    """Запрос на получение аватарки пользователя по basename (сгенерированному имени аватарки без размера)

    :arg
        basename (str): Сгенерированное имя аватарки без размера (лежит у пользователя в avatar_basename)
        file_size: (Enum(FileSize)): Размер аватарки (в данной версии это 64x64, 128x128, 256x256)

    :returns
        FileResponse: Файл
    """

    file_path = AVATAR_DIR / f"{basename}_{int(file_size.value)}.jpg"

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Avatar not found"
        )

    return FileResponse(file_path)


@router.get("/search", dependencies=[Depends(http_bearer)])
async def search_some_profiles(
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
    params: Annotated[SearchParams, Depends()],
):
    """Поиск пользователя (по юзернейму, тегам, чему угодно)"""
    try :
        profiles = await profile_service.search_profiles(
            q=params.q,
            limit=int(params.limit),
            page=int(params.page),
            order_by=params.order_by,
            desc=params.desc,
        )

        return {
            "profiles": profiles,
            "pagination": {**params.model_dump()},
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("")
async def get_all_profiles(
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """Получаем информацию о всех пользователях"""

    profiles = await profile_service.get_profiles()

    if not profiles:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Users not found"
        )

    return {"profiles": profiles}


@router.get("/{user_id}")
async def get_user_profile(
    user_id: int,
    profile_service: Annotated[ProfileService, Depends(get_profile_service)],
):
    """Получаем информацию о пользователе"""
    profile = await profile_service.get_profile_by_user_id(user_id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Users not found"
        )

    return profile
