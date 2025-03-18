import pytest


@pytest.mark.asyncio
async def test_login_user(client):
    # Корректный запрос
    response = await client.post(
        url="/auth/login",
        json={
            "email": "supermail@example.com",
            "password": "qwerty123",
        },
    )

    assert response.status_code == 200
    assert len(response.json()["access_token"]) > 0
    assert response.json()["token_type"] == "Bearer"
    assert response.cookies.get("refresh_token_cookie") is not None

    # Несуществующая почта
    response = await client.post(
        url="/auth/login",
        json={
            "email": "newmail@example.com",
            "password": "qwerty123",
        },
    )
    assert response.status_code == 401
    assert response.json() == {'detail': 'Такая почта не зарегистрирована'}

    # Ошибка валидации почты
    response = await client.post(
        url="/auth/login",
        json={
            "email": "supermail@example,com",
            "password": "qwerty321",
        },
    )
    assert response.status_code == 422

    # Неправильный пароль
    response = await client.post(
        url="/auth/login",
        json={
            "email": "supermail@example.com",
            "password": "qwerty321",
        },
    )
    assert response.status_code == 401
    assert response.json() == {'detail': 'Неправильный пароль'}

