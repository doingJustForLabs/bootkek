import pytest


@pytest.mark.asyncio
async def test_connection(client):
    """
    Проверяет базовое соединение с приложением.
    """
    response = await client.get(url="/")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_db_connection(client):
    """
    Проверяет соединение с базой данных через эндпоинт health-check.
    """
    response = await client.get(url="/health-check")
    assert response.status_code == 200
    data = response.json()
    assert "PostgreSQL" in data["version"]


@pytest.mark.asyncio
async def test_register_success(client):
    response = await client.post(
        url="/api/auth/register",
        json={
            "email": "newuser1@example.com",
            "password": "qwerty",
            "password_repeat": "qwerty",
        },
    )
    print(response.json())
    assert response.status_code == 200
    assert response.json()["user"] is not None
    assert response.json()["user"]["email"] == "newuser1@example.com"
