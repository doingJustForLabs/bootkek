from typing import Annotated

from authx import TokenPayload
from fastapi import (
    APIRouter,
    Depends,
    Response,
    HTTPException,
    status,
    Header,
)
from fastapi.security import HTTPBearer

from core.security import security
from database.db import DbSession
from database.repositories.auth import UserAuthRepository
from database.schemas.auth import UserRegisterSchema, UserLoginSchema, TokenInfo
from utils import hash_password, verify_password

router = APIRouter(tags=["Авторизация👤"], prefix="/auth")

http_bearer = HTTPBearer()


@router.post("/register")
async def register_user(creds: UserRegisterSchema, session: DbSession):
    """
    Регистрация пользователя
    """
    if await UserAuthRepository.get_user_by_email(session, creds.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email уже используется"
        )

    user_pwd = hash_password(creds.password)

    if not verify_password(creds.password_repeat, user_pwd):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Пароли не совпадают"
        )

    await UserAuthRepository.start_user(session, email=creds.email, password=user_pwd)
    return {"detail": "user registered"}


@router.post("/login", response_model=TokenInfo)
async def login_user(creds: UserLoginSchema, response: Response, session: DbSession):
    """
    Аутентификация пользователя.
    """

    user = await UserAuthRepository.get_user_by_email(session, creds.email)

    # Проверка почты
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Такая почта не зарегистрирована",
        )

    # Проверка пароля
    if not verify_password(creds.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Неправильный пароль"
        )

    access_token = security.create_access_token(uid=str(user.id), fresh=True)
    refresh_token = security.create_refresh_token(uid=str(user.id))

    security.set_refresh_cookies(response=response, token=refresh_token)

    await UserAuthRepository.start_user_session(
        session=session, refresh_token=refresh_token, user_id=int(user.id)
    )
    return TokenInfo(access_token=access_token)


@router.post("/refresh", response_model=TokenInfo)
async def refresh_new_access_token(
    refresh_token: TokenPayload = Depends(security.refresh_token_required),
    x_csrf_token: str = Header(
        ...,
        alias="X-CSRF-TOKEN",
        description="Берется из Cookie по ключу: 'csrf_refresh_token'",
    ),
):
    """
    Обновление Access токена с помощью Refresh токена
    """
    new_access_token = security.create_access_token(uid=refresh_token.sub, fresh=False)

    return TokenInfo(access_token=new_access_token)


@router.get("/me", dependencies=[Depends(http_bearer)])
async def get_protected(
    session: DbSession,
    user: Annotated[TokenPayload, Depends(security.access_token_required)],
    authorization: str = Header(
        ...,
        example="Bearer ACCESS_TOKEN",
    ),
):
    """
    Проверка авторизации

    Для каждого последующего "защищенного" запроса (с замочком)
    необходимо указывать header {"Authorization": "Bearer <AccessToken>"}.
    """
    user = await UserAuthRepository.get_user_by_user_id(session, int(user.sub))
    return {"detail": user}


@router.get("/logout", dependencies=[Depends(http_bearer)])
async def logout_user(
    user: Annotated[TokenPayload, Depends(security.access_token_required)],
    session: DbSession,
    response: Response,
    authorization: str = Header(
        ...,
        example="Bearer ACCESS_TOKEN",
    ),
):
    await UserAuthRepository.delete_user_session(session, user_id=int(user.sub))
    security.unset_refresh_cookies(response=response)

    return {"detail": "Пользователь разлогинился"}
