import pytest


@pytest.mark.asyncio
async def test_refresh_success(client, login_user):
    response = await client.get(
        "/auth/refresh", cookies={"refresh_token_cookie": login_user["refresh_token"]}
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "Bearer"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "refresh_token, expected_status, expected_response",
    [
        # Отсутствие токена в куках
        ("", 401, "Missing cookie 'refresh_token_cookie'."),
        # Невалидный токен
        ("invalid_token", 401, "Not enough segments"),
    ],
)
async def test_refresh(client, refresh_token, expected_status, expected_response):
    response = await client.get(
        "/auth/refresh", cookies={"refresh_token_cookie": refresh_token}
    )

    assert response.status_code == expected_status
    assert response.json()["detail"] == expected_response
