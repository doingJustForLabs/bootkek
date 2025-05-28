import asyncio

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy_utils import database_exists, drop_database, create_database
from fastapi.testclient import TestClient
from alembic.config import Config
from pathlib import Path

from core.config import settings
from core.database import db_helper
from alembic import command
from main import app

BASE_DIR = Path(__file__).parent.parent / "src"
ALEMBIC_CONFIG = BASE_DIR / "alembic.ini"
ALEMBIC_BASE_DIR = BASE_DIR / "alembic"


@pytest.fixture(scope="session")
def event_loop():
    """Создает цикл событий для сессии."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def setup_db_with_alembic():
    """
    Создает временную базу данных, применяет Alembic миграции
    и удаляет базу данных после завершения тестов.
    """
    temp_db_url_str: str = str(settings.db.url) + "_pytest"

    if database_exists(temp_db_url_str):
        drop_database(temp_db_url_str)

    create_database(temp_db_url_str)

    # Настройки Alembic
    alembic_cfg = Config(ALEMBIC_CONFIG)
    alembic_cfg.set_main_option("sqlalchemy.url", temp_db_url_str)
    alembic_cfg.set_main_option("script_location", str(ALEMBIC_BASE_DIR))

    # Применяем миграции
    print("Running Alembic migrations...")
    command.upgrade(alembic_cfg, "head")
    print("Alembic migrations applied.")

    # Создаем асинхронный движок для тестов
    test_engine = create_async_engine(temp_db_url_str)
    test_session = async_sessionmaker(
        bind=test_engine,
        autocommit=False,
        autoflush=False,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def override_get_db():
        async with test_session() as session:
            yield session

    app.dependency_overrides[db_helper.session_getter] = override_get_db

    yield

    # Очистка: удаление базы данных
    print(f"Dropping test database: {temp_db_url_str}")
    drop_database(temp_db_url_str)


@pytest.fixture(scope="package")
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://127.0.0.1:8000"
    ) as client:
        yield client
