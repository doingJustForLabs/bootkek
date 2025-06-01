from fastapi import APIRouter, Response, status, BackgroundTasks
from fastapi.responses import RedirectResponse

from api.auth.schemas import (
    UserLoginSchema,
    UserRegisterSchema,
    UserReadSchema,
    UserResponseSchema,
    TokenResponseSchema,
)
from api.auth.services import UserRepository, EmailRepository
from api.dependencies import (
    AccessDependency,
    BearerDependency,
    RefreshDependency,
    DbSession,
)
from core.config import settings
from schemas import BaseResponseSchema

router = APIRouter(tags=["Авторизация👤"], prefix="/auth")


@router.post("/register", response_model=UserResponseSchema)
async def register_user(
    session: DbSession, creds: UserRegisterSchema, background_tasks: BackgroundTasks
):
    """Регистрация пользователя"""
    user = await UserRepository.register_user(session, creds)
    background_tasks.add_task(EmailRepository.send_email_for_registration, user)
    return UserResponseSchema(
        detail="Мы отправили письмо на вашу почту с подтверждением аккаунта",
        user=UserReadSchema.model_validate(user),
    )


@router.post("/login", response_model=TokenResponseSchema)
async def login_user(
    session: DbSession,
    creds: UserLoginSchema,
    response: Response,
):
    """Аутентификация пользователя и выдача Access токена"""
    token = await UserRepository.authenticate_user(session, creds, response)
    return TokenResponseSchema(access_token=token)


@router.get("/activate/{activation_link}", response_model=BaseResponseSchema)
async def activate_user_account(session: DbSession, activation_link: str):
    resp = await UserRepository.activate_user(session, activation_link)
    return RedirectResponse(url=settings.front.url, status_code=status.HTTP_302_FOUND)


@router.get("/refresh", response_model=TokenResponseSchema)
async def refresh_new_access_token(
    token: RefreshDependency,
):
    """Обновление Access токена с помощью Refresh токена"""
    new_token = await UserRepository.refresh_expired_token(token)
    return TokenResponseSchema(access_token=new_token)


@router.get("/me", dependencies=[BearerDependency], response_model=UserResponseSchema)
async def get_protected(
    session: DbSession,
    token: AccessDependency,
):
    """Получение данных о пользователе"""
    user = await UserRepository.get_user_by_user_id(session, int(token.sub))
    return UserResponseSchema(user=UserReadSchema.model_validate(user), detail="Успешно")


@router.post(
    "/logout",
    dependencies=[BearerDependency],
    status_code=status.HTTP_204_NO_CONTENT,
)
async def logout_user(token: AccessDependency, response: Response):
    """Пользователь разлогинивается"""
    await UserRepository.logout_user(response)
    return
