from math import ceil
from typing import List, Sequence

from sqlalchemy.sql.elements import or_

from api.profiles.models import Profile
from api.profiles.schemas import ProfileReadDetailSchema, ProfileReadSummarySchema
from api.profiles.services import ProfileRepository
from api.search.schemas import PaginationSchema, FiltersSchema, SearchResponseSchema

# from database.repository import AbstractRepository

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from api.skills.models import Skills, UsersSkill


class SearchRepository:

    @classmethod
    async def search_profiles(
        cls,
        session: AsyncSession,
        keyword: str,
        pagination: PaginationSchema,
        filters: FiltersSchema,
    ) -> SearchResponseSchema:
        """
        SELECT (p.user_id, p.name, p.username, p.avatar_basename, skills)
        FROM profiles
        WHERE ... LIKE "%:keyword%"
        LIMIT :limit
        OFFSET :page * :limit
        ORDER BY user_id
        """

        query = (
            select(Profile)
            .where(
                or_(
                    Profile.name.like(keyword),
                    Profile.username.like(keyword),
                )
            )
            .options(
                selectinload(Profile.skills).selectinload(UsersSkill.skill),
            )
            .order_by(Profile.subscribers_count)
            .offset(pagination.limit * (pagination.page - 1))
            .limit(pagination.limit)
        )

        if filters:
            if filters.course:
                query = query.where(Profile.course == filters.course)

            if filters.faculty:
                query = query.where(Profile.faculty == filters.faculty)

            if filters.sex:
                query = query.where(Profile.sex == filters.sex)

        res = await session.execute(query)
        profiles = res.scalars().all()
        count = await ProfileRepository.get_count_profiles(session)

        return SearchResponseSchema(
            profiles=[
                ProfileReadSummarySchema.model_validate(profile) for profile in profiles
            ],
            pagination=pagination,
            total_pages=ceil(count / pagination.limit),
            total_profiles=count,
        )
