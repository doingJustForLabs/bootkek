from authx import AuthXConfig, AuthX

from core.config import settings

auth_config = AuthXConfig(
    JWT_ALGORITHM=settings.jwt.algorithm,
    JWT_SECRET_KEY=settings.jwt.secret_key,
    JWT_TOKEN_LOCATION=settings.jwt.token_location,
    JWT_ACCESS_TOKEN_EXPIRES=settings.jwt.access_token.expires,
    JWT_REFRESH_TOKEN_EXPIRES=settings.jwt.refresh_token.expires,
)

security = AuthX(config=auth_config)
