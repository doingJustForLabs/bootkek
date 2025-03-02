from authx import AuthXConfig, AuthX

from core.config import settings

auth_config = AuthXConfig(
    JWT_ALGORITHM=settings.jwt.algorithm,
    JWT_SECRET_KEY=settings.jwt.secret_key,
    JWT_ACCESS_COOKIE_NAME=settings.jwt.access_cookie_name,
    JWT_TOKEN_LOCATION=settings.jwt.token_location
)

security = AuthX(config=auth_config)