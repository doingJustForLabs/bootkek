from authx import TokenPayload
from fastapi import HTTPException, status, Response

from api.auth.models import User, TokenSession, UserRepository, TokenRepository
from api.auth.schemas import UserRegisterSchema, UserLoginSchema
from core.config import settings
from core.security import security
from database.repository import AbstractRepository
from utils import hash_password, verify_password

from datetime import datetime
from typing import Optional
from pydantic import EmailStr


class AuthService:
    def __init__(self, user_repository: type[AbstractRepository]):
        self.user_repository = user_repository()

    async def register_user(self, creds: UserRegisterSchema) -> User:
        user = await self.user_repository.find_one(email=creds.email)

        if user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already used")

        data = {
            "email": creds.email,
            "password": hash_password(creds.password),
            "role": "user"
        }
        new_user = await self.user_repository.add_one(data)
        return new_user

    async def authenticate_user(self, creds: UserLoginSchema, response: Response) -> str:
        user = await self.user_repository.find_one(email=creds.email)

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

        # await token_service.create_token_session(
        #     refresh_token=refresh_token, user_id=int(user.id)
        # )

        return access_token

    @staticmethod
    async def refresh_expired_token(token: TokenPayload) -> str:
        new_access_token = security.create_access_token(uid=token.sub, fresh=False)
        return new_access_token


class UserService:
    def __init__(self, user_repository: type[AbstractRepository]):
        self.user_repository = user_repository()

    async def get_user_by_user_id(self, user_id: int) -> Optional[User]:
        user = await self.user_repository.find_one(id=user_id)
        return user

    async def get_user_by_email(self, email: EmailStr) -> Optional[User]:
        user = await self.user_repository.find_one(email=email)
        return user

    async def create_user(self, creds: UserRegisterSchema) -> User:
        hash_pwd = hash_password(creds.password)
        data = {"email": creds.email, "password": hash_pwd, "role": "user"}

        user = await self.user_repository.add_one(data)
        return user


class TokenService:
    def __init__(self, token_repository: type[AbstractRepository]):
        self.token_repository = token_repository()

    async def create_token_session(
            self, user_id: int, refresh_token: str
    ) -> TokenSession:

        token = await self.token_repository.find_one(user_id=user_id)
        data = {
            "refresh_token": refresh_token,
            "end_date": datetime.now() + settings.jwt.refresh_token.expires,
        }

        if token:
            new_token = await self.token_repository.update_one(
                filters={"user_id": user_id}, update_data=data
            )
        else:
            data.update({"user_id": user_id})
            new_token = await self.token_repository.add_one(data)

        return new_token

    async def get_token_session_by_user_id(
            self, user_id: int
    ) -> Optional[TokenSession]:
        user_session = await self.token_repository.find_one(id=user_id)
        return user_session

    async def get_token_session_by_token(
            self, refresh_token: str
    ) -> Optional[TokenSession]:
        user_session = await self.token_repository.find_one(refresh_token=refresh_token)
        return user_session

    async def delete_user_token_session(self, user_id: int):
        pass


def get_user_service():
    return UserService(UserRepository)


def get_token_service():
    return TokenService(TokenRepository)


def get_auth_service():
    return AuthService(UserRepository)
