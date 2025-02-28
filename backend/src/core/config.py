from pydantic import PostgresDsn, BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: PostgresDsn

    model_config = SettingsConfigDict(env_file='../.env')


settings = Settings()
