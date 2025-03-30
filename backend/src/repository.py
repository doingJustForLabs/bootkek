from datetime import datetime
from abc import ABC, abstractmethod

from sqlalchemy import insert, select

from core.db import DbSession, db_helper


class AbstractRepository(ABC):
    @abstractmethod
    async def find_all(self, **kwargs):
        raise NotImplementedError

    @abstractmethod
    async def find_one(self, **kwargs):
        raise NotImplementedError

    @abstractmethod
    async def add_one(self, data: dict):
        raise NotImplementedError


class SQLAlchemyRepository(AbstractRepository):
    model = None

    async def find_all(self, **filters):
        async with db_helper.session_factory() as session:
            stmt = select(self.model)

            if filters:
                conditions = [getattr(self.model, key) == value for key, value in filters.items()]
                stmt = stmt.where(*conditions)

            res = await session.execute(stmt)
            return res.scalars().all()

    async def find_one(self, **filters):
        async with db_helper.session_factory() as session:
            stmt = select(self.model)

            if filters:
                conditions = [getattr(self.model, key) == value for key, value in filters.items()]
                stmt = stmt.where(*conditions)

            res = await session.execute(stmt)
            return res.scalars().first()

    async def add_one(self, data: dict) -> None:
        async with db_helper.session_factory() as session:
            stmt = insert(self.model).values(**data)
            await session.execute(stmt)
            await session.commit()
