async def test_profile_setup(auth_client):
    response = await auth_client.post(url="/profiles/me")

    assert response.status_code == 422
