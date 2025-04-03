from authx import AuthXConfig, AuthX

from core.config import settings

auth_config = AuthXConfig(
    JWT_ALGORITHM=settings.jwt.algorithm,
    JWT_SECRET_KEY=settings.jwt.secret_key,
    JWT_TOKEN_LOCATION=settings.jwt.token_location,
    JWT_ACCESS_TOKEN_EXPIRES=settings.jwt.access_token.expires,
    JWT_REFRESH_TOKEN_EXPIRES=settings.jwt.refresh_token.expires,
    # Cookie options
    JWT_REFRESH_COOKIE_NAME=settings.jwt.refresh_token.cookie_name,
    JWT_COOKIE_SECURE=settings.jwt.refresh_token.secure,
    JWT_COOKIE_SAMESITE=settings.jwt.refresh_token.same_site,
    JWT_COOKIE_CSRF_PROTECT=settings.jwt.refresh_token.csrf,
    JWT_REFRESH_CSRF_COOKIE_NAME=settings.jwt.refresh_token.csrf_cookie_name,
)

security = AuthX(config=auth_config)
