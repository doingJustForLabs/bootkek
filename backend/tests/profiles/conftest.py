import pytest_asyncio


@pytest_asyncio.fixture(scope="package")
async def profile(auth_client):
    response = await auth_client.post(
        url="/profiles/me",
        json={
            "name": "Егор",
            "username": "mamaelyaaa",
            "sex": "male",
            "faculty": "ЦиТХИн",
            "course": 2,
        },
    )

    assert response.status_code == 200
    assert response.json()["profile"]["name"] == "Егор"
    assert response.json()["profile"]["avatar_basename"] == "default-avatar"
