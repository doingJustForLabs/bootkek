from authx import TokenPayload
from fastapi import Response
from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.auth.models import User
from api.auth.schemas import UserRegisterSchema, UserLoginSchema, TokenResponse
from api.exceptions import BadRequestException
from core.config import settings
from core.security import security
from utils import hash_password, verify_password


class UserRepository:
    @classmethod
    async def register_user(
        cls, session: AsyncSession, creds: UserRegisterSchema
    ) -> User:
        query = select(User).where(User.email == str(creds.email))
        user = await session.scalar(query)

        if user:
            raise BadRequestException("Email is already used")

        data = {
            "email": creds.email,
            "password": hash_password(creds.password),
            "role": "user",
        }

        stmt = insert(User).values(**data).returning(User)
        res = await session.execute(stmt)
        await session.commit()

        return res.scalar_one()

    @classmethod
    async def authenticate_user(
        cls, session: AsyncSession, creds: UserLoginSchema, response: Response
    ) -> TokenResponse:
        query = select(User).where(User.email == str(creds.email))
        user = await session.scalar(query)

        if not user:
            raise BadRequestException(
                "Email doesn't registered",
            )

        if not verify_password(creds.password, user.password):
            raise BadRequestException("Incorrect password")

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

        return TokenResponse(access_token=access_token)

    @classmethod
    async def get_user_by_user_id(cls, session: AsyncSession, user_id: int) -> User:
        query = select(User).where(User.id == user_id)
        user = await session.execute(query)
        return user.scalar_one()

    @classmethod
    async def refresh_expired_token(cls, token: TokenPayload) -> str:
        new_access_token = security.create_access_token(uid=token.sub, fresh=False)
        return new_access_token

    @classmethod
    async def logout_user(cls, response: Response) -> None:
        security.unset_refresh_cookies(response=response)
        return
