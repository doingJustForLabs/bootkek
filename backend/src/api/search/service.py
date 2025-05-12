from typing import List

from api.profiles.models import Profile
from api.search.schemas import PaginationSchema, FiltersSchema

# from database.repository import AbstractRepository

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload


class SearchRepository:

    @classmethod
    async def search_profiles(
        cls,
        session: AsyncSession,
        keyword: str,
        pagination: PaginationSchema,
        filters: FiltersSchema,
    ) -> List[Profile]:
        """
        SELECT (name, username, avatar_basename)
        FROM profiles
        WHERE ... LIKE "%:keyword%"
        LIMIT :limit
        OFFSET :page * :limit
        ORDER BY user_id
        """

        # query = (
        #     select(
        #         Profile.name,
        #         Profile.username,
        #         Profile.avatar_basename,
        #     )
        #     .options(selectinload(Profile.skills))
        #     .where()
        #     .limit(pagination.limit)
        #     .offset(pagination.page * pagination.limit)
        # )

        return
