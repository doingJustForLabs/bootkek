from datetime import datetime
from typing import Annotated, AsyncGenerator

from fastapi import Depends
from sqlalchemy import Integer, func, DateTime
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncAttrs,
    AsyncSession,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from starlette_admin.contrib.sqla import Admin

from core.config import settings


class Base(AsyncAttrs, DeclarativeBase):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    create_date: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now()
    )


class DatabaseHelper:
    def __init__(self, url: str, echo: int):
        self._engine = create_async_engine(url=url, echo=echo, pool_size=5)
        self._session_factory = async_sessionmaker(
            bind=self._engine, expire_on_commit=False
        )

    async def dispose(self):
        await self._engine.dispose()

    async def session_getter(self) -> AsyncGenerator[AsyncSession, None]:
        async with self._session_factory() as session:
            yield session

    @property
    def get_engine(self):
        return self._engine


# App DB
db_helper = DatabaseHelper(url=str(settings.db.url), echo=int(settings.db.echo))
DbSession = Annotated[AsyncSession, Depends(db_helper.session_getter)]

admin = Admin(engine=db_helper.get_engine, title="База данных")
