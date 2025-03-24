import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    response = await client.post(
        url="/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "qwerty",
            "password_repeat": "qwerty",
        },
    )

    assert response.status_code == 200
    assert response.json() == {"detail": "user registered"}


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "json, expected_status",
    [
        # Повторная регистрация на существующую почту
        (
            {
                "email": "test@example.com",
                "password": "qwerty123",
                "password_repeat": "qwerty123",
            },
            400,
        ),
        # Неправильный формат почты
        (
            {
                "email": "test@example,com",
                "password": "qwerty123",
                "password_repeat": "qwerty123",
            },
            422,
        ),
        # Неправильный пароль (при вводе неправильного пароля с существующей почтой выведет первую ошибку)
        (
            {
                "email": "t1st@example.com",
                "password": "qwerty123",
                "password_repeat": "qwerty122",
            },
            400,
        ),
        # Слишком маленький пароль
        (
            {
                "email": "newtest@example.com",
                "password": "123",
                "password_repeat": "123",
            },
            422,
        ),
    ],
)
async def test_register_user(client, json, expected_status):
    response = await client.post(
        url="/auth/register",
        json=json,
    )
    assert response.status_code == expected_status
