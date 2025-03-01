from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from core.config import settings


class DatabaseHelper:
    def __init__(self, url: str, echo: bool):
        self.engine = create_async_engine(url=url, echo=echo, pool_size=5)
        self.session_factory = async_sessionmaker(bind=self.engine)

    async def dispose(self):
        await self.engine.dispose()

    async def session_getter(self):
        async with self.session_factory() as session:
            yield session


db_helper = DatabaseHelper(
    url=str(settings.db.url),
    echo=settings.db.echo
)
