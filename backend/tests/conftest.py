import asyncio
from pathlib import Path

import pytest
import pytest_asyncio
from alembic import command
from alembic.config import Config
from httpx import AsyncClient, ASGITransport

from core.config import settings
from database.db import db_helper, Base
from main import app


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().get_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db(event_loop):
    """Применяем миграции перед всеми тестами"""
    assert settings.db.mode == "TEST"

    config_path = Path(__file__).parent.parent / "src" / "alembic.ini"
    config = Config(str(config_path))

    # command.upgrade(config, "head")

    yield

    # command.downgrade(config, "base")
    await db_helper.dispose()


# @pytest_asyncio.fixture(autouse=True)
# async def clean_db():
#     """
#     Очищает все таблицы после каждого теста, сохраняя схему.
#     """
#     config_path = Path(__file__).parent.parent / "src" / "alembic.ini"
#     config = Config(str(config_path))
#
#     async with db_helper._session_factory() as session:  # type: AsyncSession
#         # отключаем внешние ключи, чтобы не было ошибок при truncate
#         command.downgrade(config, "base")
#         await session.execute()  # для SQLite
#         for table in reversed(Base.metadata.sorted_tables):
#             await session.execute(f"DELETE FROM {table.name}")
#         await session.commit()
#         await session.execute("PRAGMA foreign_keys = ON")  # включаем обратно


@pytest_asyncio.fixture(scope="package")
async def client(event_loop):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://127.0.0.1:8000/api"
    ) as client:
        yield client


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
