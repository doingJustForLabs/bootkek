from authx import TokenPayload
from fastapi import HTTPException, status, Response

from api.auth.models import User, UserRepository
from api.auth.schemas import UserRegisterSchema, UserLoginSchema
from core.config import settings
from core.security import security
from database.repository import AbstractRepository
from utils import hash_password, verify_password


class AuthService:
    def __init__(self, user_repository: type[AbstractRepository]):
        self.user_repository = user_repository()

    async def register_user(self, creds: UserRegisterSchema) -> User:
        user = await self.user_repository.find_one(email=creds.email)

        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already used"
            )

        data = {
            "email": creds.email,
            "password": hash_password(creds.password),
            "role": "user",
        }

        new_user = await self.user_repository.add_one(data=data)
        return new_user

    async def authenticate_user(
        self, creds: UserLoginSchema, response: Response
    ) -> str:
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

        return access_token

    async def get_auth_user_by_user_id(self, user_id: int) -> User:
        user = await self.user_repository.find_one(id=user_id)
        return user

    @staticmethod
    async def refresh_expired_token(token: TokenPayload) -> str:
        new_access_token = security.create_access_token(uid=token.sub, fresh=False)
        return new_access_token

    @staticmethod
    async def logout_user(response: Response) -> None:
        security.unset_refresh_cookies(response=response)
        return


def get_auth_service():
    return AuthService(UserRepository)
