from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import Session

from core.config import settings

from contextlib import asynccontextmanager

class DatabaseHelper:
    def __init__(self, url: str, echo: bool):
        self.engine = create_async_engine(url=url, echo=echo, pool_size=5)
        self.session_factory = async_sessionmaker(bind=self.engine)

    async def dispose(self):
        await self.engine.dispose()

    async def session_getter(self):
        async with self.session_factory() as session:
            yield session

    @asynccontextmanager
    async def get_db_session(self):
        session_gen = db_helper.session_getter()
        session = await session_gen.__anext__()
        try:
            yield session
        finally:
            await session.close()
            await session_gen.aclose()  # Закрываем генератор


# App DB
db_helper = DatabaseHelper(url=str(settings.db.url), echo=settings.db.echo)
DbSession = Annotated[Session, Depends(db_helper.session_getter)]
