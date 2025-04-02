from typing import Annotated

from fastapi import APIRouter, Depends, Response, HTTPException, status, Request
from fastapi.security import HTTPBearer

from api.auth.dependency import CurrentUser
from api.auth.schemas import UserRegisterSchema, TokenResponse, UserLoginSchema
from api.auth.services import (
    UserService,
    TokenService,
    get_token_service,
    get_user_service,
)
from core.config import settings
from core.security import security
from utils import hash_password, verify_password

router = APIRouter(tags=["Авторизация👤"], prefix="/auth")

http_bearer = HTTPBearer(auto_error=False)


@router.post("/register")
async def register_user(
    creds: UserRegisterSchema,
    user_service: Annotated[UserService, Depends(get_user_service)],
):
    """
    Регистрация пользователя
    """
    if await user_service.get_user_by_email(creds.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already used"
        )

    user_pwd = hash_password(creds.password)

    if not verify_password(creds.password_repeat, user_pwd):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords doesn't match"
        )

    await user_service.create_user(creds.email, user_pwd)
    return {"detail": "User successfully registered"}


@router.post("/login", response_model=TokenResponse)
async def login_user(
    creds: UserLoginSchema,
    response: Response,
    user_service: Annotated[UserService, Depends(get_user_service)],
    token_service: Annotated[TokenService, Depends(get_token_service)],
):
    """
    Аутентификация пользователя.
    """

    user = await user_service.get_user_by_email(creds.email)

    # Проверка почты
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email doesn't registered",
        )

    # Проверка пароля
    if not verify_password(creds.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password"
        )

    access_token = security.create_access_token(
        uid=str(user.id), expiry=settings.jwt.access_token.expires, fresh=True
    )

    refresh_token = security.create_refresh_token(
        uid=str(user.id), expiry=settings.jwt.refresh_token.expires
    )

    security.set_refresh_cookies(
        token=refresh_token,
        response=response,
        max_age=settings.jwt.refresh_token.expires_int,
    )

    await token_service.create_token_session(
        refresh_token=refresh_token, user_id=int(user.id)
    )
    return TokenResponse(access_token=access_token)


@router.get("/refresh")
async def refresh_new_access_token(request: Request):
    """
    Обновление Access токена с помощью Refresh токена
    """

    try:
        token = await security.get_refresh_token_from_request(request)

        # CSRF отключен
        payload = security.verify_token(
            token, verify_csrf=settings.jwt.refresh_token.csrf, verify_type=True
        )

        new_access_token = security.create_access_token(uid=payload.sub, fresh=False)

        return TokenResponse(access_token=new_access_token)

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", dependencies=[Depends(http_bearer)])
async def get_protected(user: CurrentUser):
    """
    Проверка авторизации

    Для каждого последующего "защищенного" запроса (с замочком)
    необходимо указывать header {"Authorization": "Bearer <AccessToken>"}.
    """
    return {"detail": user}


# @router.get(
#     "/logout",
#     status_code=status.HTTP_204_NO_CONTENT,
#     dependencies=[Depends(http_bearer)],
# )
# async def logout_user(
#     session: DbSession,
#     response: Response,
#     token: Annotated[TokenPayload, Depends(verify_access_token)],
# ):
#     await UserAuthRepository.delete_user_session(session, user_id=int(token.sub))
#     security.unset_refresh_cookies(response=response)
#
#     # Добавить блок лист для access токена
#
#     return {"detail": "User logout"}
