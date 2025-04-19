from abc import ABC, abstractmethod
from typing import Optional

from sqlalchemy import insert, select, update

from database.db import db_helper


class AbstractRepository(ABC):
    @abstractmethod
    async def find_all(
        self,
        offset: Optional[int] = None,
        limit: Optional[int] = None,
        order_by: Optional[str] = None,
        desc: Optional[bool] = None,
        filters: Optional[dict] = None,
    ):
        raise NotImplementedError

    @abstractmethod
    async def find_one(self, **kwargs):
        raise NotImplementedError

    @abstractmethod
    async def add_one(self, data: dict):
        raise NotImplementedError

    @abstractmethod
    async def update_one(self, update_data: dict, **kwargs):
        raise NotImplementedError

    @abstractmethod
    async def delete_one(self, user_id: int):
        raise NotImplementedError


class SQLAlchemyRepository(AbstractRepository):
    model = None

    async def find_all(
        self,
        offset: Optional[int] = None,
        limit: Optional[int] = None,
        order_by: Optional[str] = None,
        desc: Optional[bool] = None,
        filters: Optional[dict] = None,
    ):
        async with db_helper.session_factory() as session:
            query = select(self.model)

            if filters:
                for key, value in filters.items():
                    if not hasattr(self.model, key):
                        raise ValueError(f"Invalid filter field: {key}")
                    query = query.where(getattr(self.model, key) == value)

            if order_by:
                if hasattr(self.model, order_by):
                    order_field = getattr(self.model, order_by)
                    query = query.order_by(order_field.desc() if desc else order_field)
                else:
                    raise ValueError(f"Invalid order_by field: {order_by}")

            if limit:
                query = query.limit(limit)
            if offset:
                query = query.offset(offset)

            res = await session.execute(query)
            return res.scalars().all()

    async def find_one(self, **filters):
        async with db_helper.session_factory() as session:
            query = select(self.model)

            if filters:
                for key, value in filters.items():
                    if not hasattr(self.model, key):
                        raise ValueError(f"Invalid filter field: {key}")
                    query = query.where(getattr(self.model, key) == value)

            res = await session.execute(query)
            return res.scalar_one_or_none()

    async def add_one(self, data: dict) -> model:
        async with db_helper.session_factory() as session:
            stmt = insert(self.model).values(**data).returning(self.model)
            result = await session.execute(stmt)
            await session.commit()
            return result.scalar_one()

    async def update_one(self, update_data: dict, **filters) -> model:
        async with db_helper.session_factory() as session:
            stmt = (
                update(self.model).filter_by(**filters).values(**update_data)
            ).returning(self.model)
            result = await session.execute(stmt)
            await session.commit()
            return result.scalar_one()

    async def delete_one(self, user_id: int):
        pass
