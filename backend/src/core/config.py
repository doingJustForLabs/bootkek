from datetime import timedelta

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


class JWTAccessToken(BaseModel):
    expires: timedelta = timedelta(minutes=15)


class JWTRefreshToken(BaseModel):
    expires: timedelta = timedelta(days=15)


class JWTConfig(BaseModel):
    secret_key: str
    algorithm: str = "HS256"
    token_location: list[str] = ["headers", "cookies"]

    access_token: JWTAccessToken = JWTAccessToken()
    refresh_token: JWTRefreshToken = JWTRefreshToken()


class Settings(BaseSettings):
    run: RunConfig = RunConfig()
    db: DBConfig
    jwt: JWTConfig

    model_config = SettingsConfigDict(env_nested_delimiter="__", case_sensitive=False)


settings = Settings()