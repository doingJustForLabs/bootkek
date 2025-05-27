import secrets

from authx import TokenPayload
from bcrypt import gensalt, hashpw, checkpw
from fastapi import Request, status, HTTPException

from core.config import settings
from core.security import security


# Вызовите эту функцию для генерации секретного ключа
def generate_secret_key():
    return secrets.token_hex(32)


def hash_password(password: str) -> str:
    salt = gensalt()
    return hashpw(password.encode(), salt).decode()


def verify_password(password: str, hashed_password: str) -> bool:
    return checkpw(password.encode(), hashed_password.encode())


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
