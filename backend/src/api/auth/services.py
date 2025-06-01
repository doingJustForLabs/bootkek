from typing import Optional

import aiosmtplib
import uuid

from email.message import EmailMessage
from authx import TokenPayload
from fastapi import Response
from pydantic import EmailStr
from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.auth.models import User
from api.auth.schemas import (
    UserRegisterSchema,
    UserLoginSchema,
    UserResponseSchema,
    UserReadSchema,
)
from api.dependencies import DbSession
from api.exceptions import BadRequestException
from core.config import settings
from core.security import security
from schemas import BaseResponseSchema
from utils import hash_password, verify_password


class UserRepository:
    @classmethod
    async def register_user(
        cls, session: AsyncSession, creds: UserRegisterSchema
    ) -> User:
        query = select(User).where(User.email == str(creds.email))
        user = await session.scalar(query)

        if user:
            raise BadRequestException("Данная почта уже используется")

        activation_link = str(uuid.uuid4())

        data = {
            "email": creds.email,
            "password": hash_password(creds.password),
            "role": "user",
            "activation_link": activation_link,
            "active": False,
        }

        stmt = insert(User).values(**data).returning(User)
        user = await session.scalar(stmt)
        await session.commit()

        return user

    @classmethod
    async def authenticate_user(
        cls, session: AsyncSession, creds: UserLoginSchema, response: Response
    ) -> str:
        query = select(User).where(User.email == str(creds.email))
        user: User = await session.scalar(query)

        if not user:
            raise BadRequestException("Такая почта не зарегистрирована")

        if not verify_password(creds.password, user.password):
            raise BadRequestException("Неправильный пароль")

        if not user.active:
            raise BadRequestException("Проверьте свою почту и активируйте аккаунт")

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

    @classmethod
    async def activate_user(
        cls, session: DbSession, activation_link: str
    ) -> BaseResponseSchema:
        query = select(User).where(User.activation_link == activation_link)
        user: User = await session.scalar(query)

        if not user:
            raise BadRequestException(
                "Некорректный запрос. Такую ссылку никому не выдавали"
            )

        if user.active:
            raise BadRequestException("Аккаунт уже активирован")

        user.active = True
        await session.commit()
        return BaseResponseSchema(
            detail=f"Пользователь {user.email} успешно зарегистрирован"
        )


class EmailRepository:

    @classmethod
    async def send_email_for_registration(cls, user: User) -> None:
        await cls.send_email(
            recipient=user.email,
            subject="Добро пожаловать на Granite!",
            body=f"Добро пожаловать на наш сайт!\nАктивируйте аккаунт, перейдя "
            f"по ссылке: {settings.run.url}/api/auth/activate/{user.activation_link}",
        )
        return

    @classmethod
    async def send_email(cls, recipient: str, subject: str, body: str) -> None:
        admin_email = "admin@site.com"

        message = EmailMessage()
        message["From"] = admin_email
        message["To"] = recipient
        message["Subject"] = subject
        message.set_content(body)

        await aiosmtplib.send(
            message,
            sender=admin_email,
            recipients=recipient,
            hostname="localhost",
            port=1025,
        )
