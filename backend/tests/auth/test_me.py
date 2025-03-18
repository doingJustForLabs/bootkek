import pytest


# @pytest.mark.asyncio
# async def test_me(client):
#     response = await client.post(
#         url="/auth/login",
#         json={
#             "email": "supermail@example.com",
#             "password": "qwerty123",
#         },
#     )
#
#     access_token = response.json()["access_token"]
#
#     # Корректный запрос
#     me_response = await client.get(
#         url="/auth/me", headers={"Authorization": f"Bearer {access_token}"}
#     )
#
#     assert me_response.status_code == 200
#
#     # Неправильный header
#     me_response = await client.get(
#         url="/auth/me", headers={"Authorization": f"Beare {access_token}"}
#     )
#
#     assert me_response.status_code == 422
#     assert me_response.json()["message"] == "Invalid Token"
#
#     # Неправильный токен
#     me_response = await client.get(
#         url="/auth/me", headers={"Authorization": f"Bearer {access_token + '123'}"}
#     )
#
#     assert me_response.status_code == 422
#     assert me_response.json()["message"] == "Invalid Token"
