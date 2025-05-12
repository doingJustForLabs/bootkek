import pytest


@pytest.mark.asyncio
async def test_me_success(auth_client):
    response = await auth_client.get(url="/auth/me")

    assert response.status_code == 200
    assert response.json()["detail"]["email"] == "test@example.com"
    assert response.json()["detail"]["active"] == True


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "auth_header, expected_status, expected_response",
    [
        # Отсутствие заголовка Authorization
        ({}, 401, "Missing 'Bearer' in 'Authorization' header."),
        # Проверка на случай опечатки в заголовке "Authorization"
        (
            {"AuthorizationKey": "Bearer "},
            401,
            "Missing 'Bearer' in 'Authorization' header.",
        ),
        # Проверка на случай опечатки в Bearer
        ({"Authorization": f"BearerHeader "}, 401, "Not enough segments"),
        # Отсутствие токена
        ({"Authorization": "Bearer "}, 401, "Not enough segments"),
        # Невалидный токен
        ({"Authorization": "Bearer invalid_token"}, 401, "Not enough segments"),
    ],
)
async def test_valid_token(
    client, login_user, auth_header, expected_status, expected_response
):
    response = await client.get(url="/auth/me", headers=auth_header)

    assert response.status_code == expected_status
    assert response.json()["detail"] == expected_response
