import pytest


@pytest.mark.asyncio
async def test_login_user_success(client, register_user):
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


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "json, expected_status, expected_response",
    [
        # Проверка на случай неправильного пароля
        (
            {
                "email": "test@example.com",
                "password": "qwerty122",
            },
            400,
            {"detail": "Incorrect password"},
        ),
        # Проверка на случай незарегистрированной почты
        (
            {
                "email": "invalid@example.com",
                "password": "qwerty123",
            },
            400,
            {"detail": "Email doesn't registered"},
        ),
    ],
)
async def test_login_user(
    client, register_user, json, expected_status, expected_response
):
    response = await client.post(
        url="/auth/login",
        json=json,
    )
    assert response.status_code == expected_status
    assert response.json() == expected_response
