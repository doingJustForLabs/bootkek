from aiohttp import ClientSession


class ApiClient:
    def __init__(self, base_url: str):
        self._base_url = base_url
        self._session: ClientSession | None = None

    async def create_session(self):
        if self._session is None:
            self._session = ClientSession(base_url=f"{self._base_url}")

    async def close_session(self):
        if self._session and not self._session.closed:
            await self._session.close()
        self._session = None

    async def login(self, email, password):
        data = {"email": email, "password": password}

        async with self._session.post("/auth/login", json=data) as resp:
            res = await resp.json()
            return res


api_client = ApiClient(base_url="http://backend:8000")
