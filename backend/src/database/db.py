from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import Session

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


class TestDatabaseHelper(DatabaseHelper):
    def __init__(self, url: str, echo: bool):
        super().__init__(url, echo)

    async def session_getter(self):
        async with self.session_factory() as session:
            yield session


# App DB
db_helper = DatabaseHelper(url=str(settings.db.url), echo=settings.db.echo)
DbSession = Annotated[Session, Depends(db_helper.session_getter)]

# App Test DB
test_db_helper = TestDatabaseHelper(
    url=str(settings.test_db.url), echo=settings.test_db.echo
)
TestDbSession = Annotated[Session, Depends(test_db_helper.session_getter)]
