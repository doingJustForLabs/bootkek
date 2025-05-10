import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from alembic import command
from alembic.config import Config
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from database.db import db_helper, Base
from main import app
from pathlib import Path


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().get_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def alembic_config():
    print(Path(__file__))
    config = Config("alembic.ini")
    # config.set_main_option("sqlalchemy.url", str(settings.db.url))
    return config


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db(alembic_config):
    """Применяем миграции перед всеми тестами и очищаем после"""
    assert settings.db.mode == "TEST"

    # Применяем все миграции
    command.upgrade(alembic_config, "head")

    yield

    # Полная очистка базы после всех тестов
    async with db_helper.get_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await db_helper.dispose()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Сессия для работы с базой, автоматически откатывает изменения после теста"""
    async with db_helper.session_getter() as session:
        try:
            yield session
        finally:
            # Откатываем транзакцию после каждого теста
            await session.rollback()


@pytest_asyncio.fixture
async def client(db_session) -> AsyncGenerator[AsyncClient, None]:
    """Тестовый клиент"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest_asyncio.fixture(scope="package")
async def register_user(client):
    response = await client.post(
        url="/auth/register",
        json={
            "email": "test@example.com",
            "password": "qwerty123",
            "password_repeat": "qwerty123",
        },
    )
    assert response.status_code == 200
    assert response.json()["user"] is not None
    assert response.json()["user"]["email"] == "test@example.com"


@pytest_asyncio.fixture(scope="package")
async def login_user(client, register_user):
    response = await client.post(
        url="/auth/login",
        json={
            "email": "test@example.com",
            "password": "qwerty123",
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "Bearer"
    assert response.cookies.get("refresh_token_cookie") is not None

    return {
        "access_token": response.json()["access_token"],
        "refresh_token": response.cookies.get("refresh_token_cookie"),
    }


@pytest_asyncio.fixture(scope="package")
async def auth_client(event_loop, login_user):
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://127.0.0.1:8000/api",
        headers={"Authorization": f"Bearer {login_user['access_token']}"},
    ) as auth_client:
        yield auth_client
