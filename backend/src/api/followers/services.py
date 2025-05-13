from typing import List

from sqlalchemy import select, and_, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.orm import aliased

from api.exceptions import BadRequestException, NotFoundException
from api.profiles.models import Profile
from api.followers.models import Follower


class FollowerRepository:
    @classmethod
    async def subscribe(
        cls, session: AsyncSession, follower_id: int, target_id: int
    ) -> Follower:

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

        try:
            new_follow = Follower(
                follower_id=follower_id,
                target_id=target_id,
            )
            session.add(new_follow)

            await cls._update_profile_counts(
                session, follower_id, target_id, increment=True
            )
            await session.commit()
            return new_follow

        except IntegrityError:
            await session.rollback()
            raise NotFoundException("Профиль не найден")

    @classmethod
    async def unsubscribe(
        cls, session: AsyncSession, follower_id: int, target_id: int
    ) -> None:

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
    async def get_user_followers(cls, session: AsyncSession, user_id: int):
        try:
            query = (
                select(
                    Profile.user_id,
                    Profile.name,
                    Profile.username,
                    Profile.avatar_basename,
                )
                .distinct()
                .where(Follower.target_id == user_id, Profile.user_id != user_id)
                .order_by(Profile.user_id)
            )

            res = await session.execute(query)
            return [
                {
                    "user_id": row.user_id,
                    "name": row.name,
                    "username": row.username,
                    "avatar_basename": row.avatar_basename,
                }
                for row in res
            ]

        except NotFoundException as e:
            return e

    @classmethod
    async def get_user_follows(cls, session: AsyncSession, user_id: int):
        try:
            query = (
                select(
                    Profile.user_id,
                    Profile.name,
                    Profile.username,
                    Profile.avatar_basename,
                )
                .distinct()
                .where(Follower.follower_id == user_id, Profile.user_id != user_id)
                .order_by(Profile.user_id)
            )

            res = await session.execute(query)
            return [
                {
                    "user_id": row.user_id,
                    "name": row.name,
                    "username": row.username,
                    "avatar_basename": row.avatar_basename,
                }
                for row in res
            ]

        except NotFoundException as e:
            return e
