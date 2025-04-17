from typing import Annotated

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
from api.auth.services import (
    UserService,
    get_user_service, AuthService, get_auth_service,
)
from core.config import settings
from core.security import security

router = APIRouter(tags=["Авторизация👤"], prefix="/auth")

http_bearer = HTTPBearer(auto_error=False)


async def verify_access_token(request: Request) -> str:
    try:
        token = await security.get_access_token_from_request(
            request,
            locations=["headers"],
        )

        payload = security.verify_token(token)
        return payload

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


async def verify_refresh_token(request: Request) -> str:
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
    creds: UserRegisterSchema,
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    """
    Регистрация пользователя

    :param

        creds (UserRegisterSchema): Данные пользователя (email, пароль и его повтор)

    :returns

        Пользователь регистрируется (сохраняется в базу данных)
    """
    user = await auth_service.register_user(creds)
    return UserResponseSchema(user=UserDataSchema.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login_user(
    creds: UserLoginSchema,
    response: Response,
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    """
    Аутентификация пользователя

    :param

        creds (UserLoginSchema): Данные для авторизации пользователя (email, пароль)

    :returns

        TokenResponse: пользователь получает access токен (fresh) и его тип
    """
    token = await auth_service.authenticate_user(creds, response)
    return TokenResponse(access_token=token)


@router.get("/refresh", response_model=TokenResponse)
async def refresh_new_access_token(
    token: RefreshDependency,
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    """
    Обновление Access токена с помощью Refresh токена

    :returns

        TokenResponse: пользователь получает access токен и его тип
    """
    token = await auth_service.refresh_expired_token(token)
    return TokenResponse(access_token=token)


@router.get(
    "/me", dependencies=[Depends(http_bearer)], response_model=UserResponseSchema
)
async def get_protected(
    token: AccessDependency,
    user_service: Annotated[UserService, Depends(get_user_service)]
):
    """
    Получение данных о пользователе

    :header

        token: Пользователь должен отправить в заголовок запроса {"Authorization": "Bearer <access_токен>"}

    :returns

        user: Информация о пользователе (email, хэшированный пароль и другие приватные данные)
    """
    user = await user_service.get_user_by_user_id(int(token.sub))
    return UserResponseSchema(user=UserDataSchema.model_validate(user))


@router.get("/logout", dependencies=[Depends(http_bearer)])
async def logout_user(response: Response):
    security.unset_refresh_cookies(response=response)

    return {"detail": "User logout"}
