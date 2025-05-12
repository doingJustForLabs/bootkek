from typing import Annotated

from authx import TokenPayload
from fastapi import APIRouter, Depends, Response, HTTPException, status, Request
from authx import TokenPayload
from fastapi import APIRouter, Depends, Response, HTTPException, status, Request
from fastapi.security import HTTPBearer

from api.auth.schemas import (
    UserRegisterSchema,
    TokenResponse,
    UserLoginSchema,
    UserResponseSchema,
    UserDataSchema,
)
from api.auth.services import UserRepository
from core.config import settings
from core.security import security
from database.db import DbSession

router = APIRouter(tags=["Авторизация👤"], prefix="/auth")

http_bearer = HTTPBearer(auto_error=False)


async def verify_access_token(request: Request) -> TokenPayload:
    try:
        token = await security.get_access_token_from_request(
            request,
            locations=["headers"],
        )

        payload = security.verify_token(token)
        return payload

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


async def verify_refresh_token(request: Request) -> TokenPayload:
    try:
        token = await security.get_refresh_token_from_request(
            request, locations=["cookies"]
        )

        payload = security.verify_token(
            token, verify_csrf=settings.jwt.refresh_token.csrf, verify_type=True
        )

        return payload

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


AccessDependency = Annotated[TokenPayload, Depends(verify_access_token)]
RefreshDependency = Annotated[TokenPayload, Depends(verify_refresh_token)]


@router.post("/register", response_model=UserResponseSchema)
async def register_user(
    session: DbSession,
    creds: UserRegisterSchema,
):
    """Регистрация пользователя"""
    user = await UserRepository.register_user(session, creds)
    return UserResponseSchema(user=UserDataSchema.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login_user(
    session: DbSession,
    creds: UserLoginSchema,
    response: Response,
):
    """Аутентификация пользователя и выдача Access токена"""
    token = await UserRepository.authenticate_user(session, creds, response)
    return token


@router.get("/refresh", response_model=TokenResponse)
async def refresh_new_access_token(
    token: RefreshDependency,
):
    """Обновление Access токена с помощью Refresh токена"""
    token = await UserRepository.refresh_expired_token(token)
    return TokenResponse(access_token=token)


@router.get(
    "/me", dependencies=[Depends(http_bearer)], response_model=UserResponseSchema
)
async def get_protected(
    session: DbSession,
    token: AccessDependency,
):
    """Получение данных о пользователе"""
    user = await UserRepository.get_user_by_user_id(session, int(token.sub))
    return UserResponseSchema(user=UserDataSchema.model_validate(user))


@router.post(
    "/logout",
    dependencies=[Depends(http_bearer)],
    status_code=status.HTTP_204_NO_CONTENT,
)
async def logout_user(response: Response):
    """Пользователь разлогинивается"""
    await UserRepository.logout_user(response)
