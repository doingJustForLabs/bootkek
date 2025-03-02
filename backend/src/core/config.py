from dotenv import load_dotenv
from pydantic import PostgresDsn, BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class RunConfig(BaseModel):
    host: str = '127.0.0.1'
    port: int = 8000


class DBConfig(BaseModel):
    url: PostgresDsn
    echo: int


class JWTConfig(BaseModel):
    secret_key: str
    algorithm: str = 'HS256'
    access_cookie_name: str = 'access_token_cookie'
    token_location: list[str] = ['cookies']


class Settings(BaseSettings):
    run: RunConfig = RunConfig()
    db: DBConfig
    jwt: JWTConfig

    model_config = SettingsConfigDict(env_nested_delimiter='__', case_sensitive=False)


settings = Settings()
