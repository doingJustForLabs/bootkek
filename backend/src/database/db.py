from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncAttrs,
    AsyncSession,
)
from sqlalchemy.orm import DeclarativeBase

from core.config import settings


class Base(AsyncAttrs, DeclarativeBase):
    pass


class DatabaseHelper:
    def __init__(self, url: str, echo: bool):
        self.engine = create_async_engine(url=url, echo=echo, pool_size=5)
        self.session_factory = async_sessionmaker(
            bind=self.engine, expire_on_commit=False
        )

    async def dispose(self):
        await self.engine.dispose()

    async def session_getter(self):
        async with self.session_factory() as session:
            yield session

# App DB
db_helper = DatabaseHelper(url=str(settings.db.url), echo=settings.db.echo)
DbSession = Annotated[AsyncSession, Depends(db_helper.session_getter)]
