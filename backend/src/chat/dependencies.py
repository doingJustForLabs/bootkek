from jose import jwt, JWTError
from core.config import settings



async def verify_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.jwt.secret_key, algorithms=settings.jwt.algorithm)
        return int(payload.get("sub")) # ID пользователя
    except JWTError:
        return None