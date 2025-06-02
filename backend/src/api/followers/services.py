from typing import Optional, Sequence

from sqlalchemy import select, and_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.functions import func

from api.exceptions import BadRequestException, NotFoundException
from api.followers.models import Follower
from api.profiles.models import Profile
from api.search.schemas import PaginationSchema
from api.skills.models import UsersSkill


class FollowerRepository:
    @classmethod
    async def subscribe(
        cls, session: AsyncSession, follower_id: int, target_id: int
    ) -> None:

        if follower_id == target_id:
            raise BadRequestException("Вы не можете подписаться на самого себя")

        existing = await session.scalar(
            select(Follower).where(
                and_(
                    Follower.follower_id == follower_id, Follower.target_id == target_id
                )
            )
        )

        if existing:
            raise BadRequestException("Подписка уже существует")

        new_follow = Follower(
            follower_id=follower_id,
            target_id=target_id,
        )
        session.add(new_follow)

        await cls._update_profile_counts(
            session, follower_id, target_id, increment=True
        )
        await session.commit()
        return

    @classmethod
    async def unsubscribe(
        cls, session: AsyncSession, follower_id: int, target_id: int
    ) -> None:
        if follower_id == target_id:
            raise BadRequestException("Вы не можете отписаться от себя")

        follow = await session.scalar(
            select(Follower).where(
                and_(
                    Follower.follower_id == follower_id, Follower.target_id == target_id
                )
            )
        )

        if not follow:
            raise NotFoundException("Подписка не найдена")

        await session.delete(follow)
        await cls._update_profile_counts(
            session, follower_id, target_id, increment=False
        )
        await session.commit()
        return

    @staticmethod
    async def is_following(
        session: AsyncSession, follower_id: int, target_id: int
    ) -> bool:
        result = await session.execute(
            select(Follower)
            .where(Follower.follower_id == follower_id)
            .where(Follower.target_id == target_id)
        )
        return result.scalars().first() is not None

    @classmethod
    async def _update_profile_counts(
        cls, session: AsyncSession, follower_id: int, target_id: int, increment: bool
    ) -> None:
        change = 1 if increment else -1

        await session.execute(
            update(Profile)
            .where(Profile.id == target_id)
            .values(subscribers_count=Profile.subscribers_count + change)
        )
        await session.execute(
            update(Profile)
            .where(Profile.id == follower_id)
            .values(subscriptions_count=Profile.subscriptions_count + change)
        )

    @classmethod
    async def get_user_followers(
        cls,
        session: AsyncSession,
        user_id: int,
        pagination: Optional[PaginationSchema] = None,
    ) -> Sequence[Profile]:

        query = (
            select(Profile)
            .join(Follower, Follower.follower_id == Profile.user_id)
            .where(Follower.target_id == user_id)
            .options(
                selectinload(Profile.skills).selectinload(UsersSkill.skill),
            )
            .order_by(Profile.user_id)
            .offset(pagination.limit * (pagination.page - 1))
            .limit(pagination.limit)
        )

        res = await session.execute(query)
        return res.scalars().all()

    @classmethod
    async def get_user_follows(
        cls,
        session: AsyncSession,
        user_id: int,
        pagination: PaginationSchema,
    ) -> Sequence[Profile]:
        query = (
            select(Profile)
            .join(Follower, Follower.target_id == Profile.user_id)
            .where(Follower.follower_id == user_id)
            .order_by(Profile.user_id)
            .options(
                selectinload(Profile.skills).selectinload(UsersSkill.skill),
            )
            .offset(pagination.limit * (pagination.page - 1))
            .limit(pagination.limit)
        )

        res = await session.execute(query)
        return res.scalars().all()

    @classmethod
    async def get_count_user_followers(cls, session: AsyncSession, user_id: int) -> int:
        query = (
            select(func.count())
            .select_from(Follower)
            .where(Follower.target_id == user_id)
        )
        res = await session.execute(query)
        return res.scalar_one()

    @classmethod
    async def get_count_user_follows(cls, session: AsyncSession, user_id: int) -> int:
        query = (
            select(func.count())
            .select_from(Follower)
            .where(Follower.follower_id == user_id)
        )
        res = await session.execute(query)
        return res.scalar_one()
