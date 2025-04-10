from datetime import datetime
from typing import Optional

from pydantic import EmailStr

from api.auth.models import User, TokenSession, UserRepository, TokenRepository
from api.auth.schemas import UserRegisterSchema
from core.config import settings
from database.repository import AbstractRepository
from utils import hash_password, verify_password


class UserService:
    def __init__(self, profile_repository: type[AbstractRepository]):
        self.profile_repository = profile_repository()

    async def get_user_by_user_id(self, user_id: int) -> Optional[User]:
        user = await self.profile_repository.find_one(id=user_id)
        return user

    async def get_user_by_email(self, email: EmailStr) -> Optional[User]:
        user = await self.profile_repository.find_one(email=email)
        return user

    async def create_user(self, creds: UserRegisterSchema) -> Optional[User]:
        hash_pwd = hash_password(creds.password)

        if not verify_password(creds.password_repeat, hash_pwd):
            return None

        data = {"email": creds.email, "password": hash_pwd, "role": "user"}

        user = await self.profile_repository.add_one(data)
        return user


class TokenService:
    def __init__(self, profile_repository: type[AbstractRepository]):
        self.profile_repository = profile_repository()

    async def create_token_session(
        self, user_id: int, refresh_token: str
    ) -> TokenSession:
        data = {
            "user_id": user_id,
            "refresh_token": refresh_token,
            "start_date": datetime.now(),
            "end_date": datetime.now() + settings.jwt.refresh_token.expires,
        }
        token = await self.profile_repository.add_one(data)
        return token

    async def get_token_session_by_user_id(
        self, user_id: int
    ) -> Optional[TokenSession]:
        user_session = await self.profile_repository.find_one(id=user_id)
        return user_session

    async def get_token_session_by_token(
        self, refresh_token: str
    ) -> Optional[TokenSession]:
        user_session = await self.profile_repository.find_one(
            refresh_token=refresh_token
        )
        return user_session

    async def delete_user_token_session(self, user_id: int):
        pass


def get_user_service():
    return UserService(UserRepository)


def get_token_service():
    return TokenService(TokenRepository)
