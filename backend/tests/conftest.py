import asyncio

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from core.config import settings
from database.db import db_helper
from database.models import Base
from main import app


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().get_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db(event_loop):
    assert settings.db.mode == "TEST"

    async with db_helper.engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    db_helper.session_getter()


@pytest_asyncio.fixture(scope="session")
async def client(event_loop):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://127.0.0.1:8000/api"
    ) as client:
        yield client


@pytest_asyncio.fixture(scope="function")
async def auth_client(event_loop, login_user):
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://127.0.0.1:8000/api",
        headers={"Authorization": f"Bearer {login_user['access_token']}"},
    ) as auth_client:
        yield auth_client
