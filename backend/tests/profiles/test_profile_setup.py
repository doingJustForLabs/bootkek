import pytest


@pytest.mark.asyncio
async def test_profile_setup_success(auth_client):
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


@pytest.mark.asyncio
@pytest.mark.parametrize("json, expected_status", [({}, 409)])
async def test_profile_setup(auth_client, profile, json, expected_status):
    response = await auth_client.post(url="/profiles/me", json=json)

    assert response.status_code == expected_status
