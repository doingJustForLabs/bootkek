from datetime import datetime
from typing import Optional

from pydantic import EmailStr

from api.auth.models import User, UserSession, UserRepository, TokenRepository
from core.config import settings
from database.repository import AbstractRepository


class UserService:
    def __init__(self, user_repository: type[AbstractRepository]):
        self.user_repository = user_repository()

    async def get_user_by_user_id(self, user_id: int) -> User:
        user = await self.user_repository.find_one(id=user_id)
        return user if user else None

    async def get_user_by_email(self, email: EmailStr) -> Optional[User]:
        user = await self.user_repository.find_one(email=email)
        return user if user else None

    async def create_user(self, email: EmailStr, hashed_password: str) -> None:
        data = {"email": email, "password": hashed_password}
        await self.user_repository.add_one(data)


class TokenService:
    def __init__(self, user_repository: type[AbstractRepository]):
        self.user_repository = user_repository()

    async def create_token_session(self, user_id: int, refresh_token: str) -> None:
        data = {
            "user_id": user_id,
            "refresh_token": refresh_token,
            "start_date": datetime.now(),
            "end_date": datetime.now() + settings.jwt.refresh_token.expires,
        }
        await self.user_repository.add_one(data)

    async def get_token_session_by_user_id(self, user_id: int) -> Optional[UserSession]:
        user_session = await self.user_repository.find_one(id=user_id)
        return user_session if user_session else None

    async def get_token_session_by_token(
        self, refresh_token: str
    ) -> Optional[UserSession]:
        user_session = await self.user_repository.find_one(refresh_token=refresh_token)
        return user_session if user_session else None

    async def delete_user_token_session(self, user_id: int):
        pass


def get_user_service():
    return UserService(UserRepository)


def get_token_service():
    return TokenService(TokenRepository)
