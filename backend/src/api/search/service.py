from math import ceil
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, aliased
from sqlalchemy.sql.elements import or_

from api.profiles.models import Profile
from api.profiles.schemas import ProfileReadSummarySchema
from api.search.schemas import PaginationSchema, FiltersSchema, SearchResponseSchema
from api.skills.models import UsersSkill, Skills


class SearchRepository:

    @classmethod
    async def search_profiles(
        cls,
        session: AsyncSession,
        keyword: Optional[str],
        pagination: PaginationSchema,
        filters: FiltersSchema,
    ) -> SearchResponseSchema:

        base_query = select(Profile)

        if keyword:
            skill_alias = aliased(Skills)
            base_query = (
                base_query.outerjoin(Profile.skills)
                .outerjoin(UsersSkill.skill.of_type(skill_alias))
                .where(
                    or_(
                        Profile.name.ilike(f"%{keyword}%"),
                        Profile.username.ilike(f"%{keyword}%"),
                        skill_alias.skill_name.ilike(f"%{keyword}%"),
                    )
                )
            )

        if filters:
            if filters.course:
                base_query = base_query.where(Profile.course == filters.course)
            if filters.faculty:
                base_query = base_query.where(Profile.faculty == filters.faculty)
            if filters.sex:
                base_query = base_query.where(Profile.sex == filters.sex)

        paginated_query = (
            base_query.order_by(Profile.subscribers_count.desc())
            .offset(pagination.limit * (pagination.page - 1))
            .limit(pagination.limit)
            .options(
                selectinload(Profile.skills).selectinload(UsersSkill.skill),
            )
        )

        count_query = select(func.count()).select_from(base_query.subquery())

        profiles = (await session.scalars(paginated_query)).all()
        total_count = (await session.execute(count_query)).scalar_one()

        return SearchResponseSchema(
            profiles=[ProfileReadSummarySchema.model_validate(p) for p in profiles],
            pagination=pagination,
            total_pages=ceil(total_count / pagination.limit),
            total_profiles=total_count,
        )
