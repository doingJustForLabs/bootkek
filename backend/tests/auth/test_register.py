# @pytest.mark.asyncio
# async def test_register_user(client):
# response = await client.post(
#     url="/auth/register",
#     json={
#         "email": user.email,
#         "password": user.password,
#         "password_repeat": user.password_repeat
#     },
# )
# assert response.status_code == 200
# assert response.json() == {"detail": "user registered"}
