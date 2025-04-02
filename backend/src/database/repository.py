from abc import ABC, abstractmethod
from typing import List

from sqlalchemy import insert, select, update

from database.db import db_helper


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

    @abstractmethod
    async def update_one(self, user_id: int, update_data: dict):
        raise NotImplementedError


class SQLAlchemyRepository(AbstractRepository):
    model = None

    async def find_all(self, **filters) -> List[model]:
        async with db_helper.session_factory() as session:
            stmt = select(self.model)

            if filters:
                conditions = [
                    getattr(self.model, key) == value for key, value in filters.items()
                ]
                stmt = stmt.where(*conditions)

            res = await session.execute(stmt)
            return res.scalars().all()

    async def find_one(self, **filters) -> model:
        async with db_helper.session_factory() as session:
            stmt = select(self.model)

            if filters:
                conditions = [
                    getattr(self.model, key) == value for key, value in filters.items()
                ]
                stmt = stmt.where(*conditions)

            res = await session.execute(stmt)
            return res.scalar_one_or_none()

    async def add_one(self, data: dict) -> None:
        async with db_helper.session_factory() as session:
            stmt = insert(self.model).values(**data)
            await session.execute(stmt)
            await session.commit()

    async def update_one(self, user_id: int, update_data: dict) -> None:
        async with db_helper.session_factory() as session:
            stmt = (
                update(self.model).where(user_id == self.model.id).values(**update_data)
            )
            await session.execute(stmt)
            await session.commit()
