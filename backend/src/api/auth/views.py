from fastapi import APIRouter, Response, status

from api.auth.schemas import (
    UserLoginSchema,
    UserRegisterSchema,
    UserReadSchema,
    UserResponseSchema,
    TokenResponseSchema,
)
from api.auth.services import UserRepository
from api.dependencies import (
    AccessDependency,
    BearerDependency,
    RefreshDependency,
    DbSession,
)

router = APIRouter(tags=["Авторизация👤"], prefix="/auth")


@router.post("/register", response_model=UserResponseSchema)
async def register_user(
    session: DbSession,
    creds: UserRegisterSchema,
):
    """Регистрация пользователя"""
    user = await UserRepository.register_user(session, creds)
    return UserResponseSchema(user=UserReadSchema.model_validate(user))


@router.post("/login", response_model=TokenResponseSchema)
async def login_user(
    session: DbSession,
    creds: UserLoginSchema,
    response: Response,
):
    """Аутентификация пользователя и выдача Access токена"""
    token = await UserRepository.authenticate_user(session, creds, response)
    return token


@router.get("/refresh", response_model=TokenResponseSchema)
async def refresh_new_access_token(
    token: RefreshDependency,
):
    """Обновление Access токена с помощью Refresh токена"""
    token = await UserRepository.refresh_expired_token(token)
    return token


@router.get("/me", dependencies=[BearerDependency], response_model=UserResponseSchema)
async def get_protected(
    session: DbSession,
    token: AccessDependency,
):
    """Получение данных о пользователе"""
    user = await UserRepository.get_user_by_user_id(session, int(token.sub))
    return UserResponseSchema(user=UserReadSchema.model_validate(user))


@router.post(
    "/logout",
    dependencies=[BearerDependency],
    status_code=status.HTTP_204_NO_CONTENT,
)
async def logout_user(response: Response):
    """Пользователь разлогинивается"""
    await UserRepository.logout_user(response)
