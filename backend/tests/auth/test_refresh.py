import pytest


# @pytest.mark.asyncio
# async def test_refresh_user(client):
# login_response = await client.post(
#     url="/auth/login",
#     json={
#         "email": "supermail@example.com",
#         "password": "qwerty123",
#     },
# )
# print(login_response)
# assert login_response.status_code == 200

# refresh_response = await client.get(
#     "/auth/refresh",
#     cookies={"refresh_token": refresh_token}
# )
# assert refresh_response.status_code == 200
# assert "access_token" in refresh_response.json()
