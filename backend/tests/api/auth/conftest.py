import pytest
import pytest_asyncio


# @pytest.fixture(scope="package")
# async def register_user(client):
#     response = await client.post(
#         url="/auth/register",
#         json={
#             "email": "test@example.com",
#             "password": "qwerty123",
#             "password_repeat": "qwerty123",
#         },
#     )
#     assert response.status_code == 200
#     assert response.json()["user"] is not None
#     assert response.json()["user"]["email"] == "test@example.com"
#
#
# @pytest_asyncio.fixture(scope="package")
# async def login_user(client, register_user):
#     response = await client.post(
#         url="/auth/login",
#         json={
#             "email": "test@example.com",
#             "password": "qwerty123",
#         },
#     )
#
#     assert response.status_code == 200
#     assert "access_token" in response.json()
#     assert response.json()["token_type"] == "Bearer"
#     assert response.cookies.get("refresh_token_cookie") is not None
#
#     return {
#         "access_token": response.json()["access_token"],
#         "refresh_token": response.cookies.get("refresh_token_cookie"),
#     }


# @pytest_asyncio.fixture(scope="function")
# async def refresh_token(client, login_user):
#     response = await client.get(
#         "/auth/refresh", cookies={"refresh_token_cookie": login_user["refresh_token"]}
#     )
#
#     assert response.status_code == 200
#     assert "access_token" in response.json()
#     assert response.json()["token_type"] == "Bearer"
#
#     return {"access_token": response.json()["access_token"]}
