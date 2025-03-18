from datetime import datetime

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

    JWT_ACCESS_COOKIE_NAME="access_token_cookie",
    JWT_COOKIE_CSRF_PROTECT=settings.jwt.refresh_token.csrf,
    JWT_ACCESS_CSRF_COOKIE_NAME="csrf_access_token",
    JWT_REFRESH_CSRF_COOKIE_NAME="csrf_refresh_token",
    JWT_ACCESS_CSRF_HEADER_NAME="X-CSRF-TOKEN-Access",
    JWT_REFRESH_CSRF_HEADER_NAME="X-CSRF-TOKEN-Refresh",
)

security = AuthX(config=auth_config)
