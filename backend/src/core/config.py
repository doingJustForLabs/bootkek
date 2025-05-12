from datetime import timedelta
from typing import Optional
from pathlib import Path

from dotenv import load_dotenv
from pydantic import PostgresDsn, BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class RunConfig(BaseModel):
    host: str = "127.0.0.1"
    port: int = 8000


class DBConfig(BaseModel):
    url: PostgresDsn
    echo: int
    mode: str = "DEV"


class JWTAccessToken(BaseModel):
    expires: timedelta = timedelta(minutes=15)
    expires_int: int = int(expires.total_seconds())


class JWTRefreshToken(BaseModel):
    expires: timedelta = timedelta(days=30)
    expires_int: int = int(expires.total_seconds())

    cookie_name: str = "refresh_token_cookie"
    same_site: str = "lax"
    secure: bool = False

    csrf: bool = False
    csrf_cookie_name: str = "csrf_refresh_token"


class JWTConfig(BaseModel):
    secret_key: str
    algorithm: str = "HS256"
    token_location: list[str] = ["headers", "cookies"]

    access_token: JWTAccessToken = JWTAccessToken()
    refresh_token: JWTRefreshToken = JWTRefreshToken()


class FilesConfig(BaseModel):
    static_dir: Path = Path(__file__).parent.parent.parent / "static"
    avatar_dir: Path = static_dir / "avatars"


class Settings(BaseSettings):
    run: RunConfig = RunConfig()
    db: DBConfig
    jwt: JWTConfig
    files: FilesConfig = FilesConfig()

    model_config = SettingsConfigDict(env_nested_delimiter="__", case_sensitive=False)


settings = Settings()
