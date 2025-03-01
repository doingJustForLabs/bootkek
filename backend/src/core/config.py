from dotenv import load_dotenv
from pydantic import PostgresDsn, BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class RunConfig(BaseModel):
    host: str = '127.0.0.1'
    port: int = 8000


class DBConfig(BaseModel):
    url: PostgresDsn
    echo: int = 0


class Settings(BaseSettings):
    run: RunConfig = RunConfig()
    db: DBConfig

    model_config = SettingsConfigDict(env_nested_delimiter='_', case_sensitive=False)


settings = Settings()
