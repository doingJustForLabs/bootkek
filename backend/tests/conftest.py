import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from main import app


@pytest_asyncio.fixture(scope="session")
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://127.0.0.1:8000/api"
    ) as client:
        yield client
