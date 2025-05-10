from typing import List

from sqlalchemy import select, and_, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from api.exceptions import BadRequestException, NotFoundException
from api.profiles.models import Profile
from api.followers.models import Follower


class FollowerRepository:
    @classmethod
    async def subscribe(
        cls, session: AsyncSession, follower_id: int, target_id: int
    ) -> Follower:

        if follower_id == target_id:
            raise BadRequestException("You can't subscribe to yourself")

        existing = await session.scalar(
            select(Follower).where(
                and_(
                    Follower.follower_id == follower_id, Follower.target_id == target_id
                )
            )
        )

        if existing:
            raise BadRequestException("Subscription already exists")

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
            raise NotFoundException("Profile not found")

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
            raise NotFoundException("Follow not found")

        await session.delete(follow)
        await cls._update_profile_counts(
            session, follower_id, target_id, increment=False
        )
        await session.commit()

        return

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
        cls, session: AsyncSession, user_id: int
    ) -> List[Profile]:
        """
        Вывести список пользователей с полями (user_id, name, username, avatar_basename) на которых
        подписан текущий пользователь (по user_id)

        Может использовать relationship?

        Примерный ответ:
        [
            {
                "user_id": 5
                "name": "name"
                "username": "biba"
                "avatar_basename": "qwerty123"
            },
            {
                "user_id": 7
                "name": "name"
                "username": "boba"
                "avatar_basename": "super_avatar"
            }
        ]
        """
        pass

    @classmethod
    async def get_user_follows(
        cls, session: AsyncSession, user_id: int
    ) -> List[Profile]:
        """
        Вывести список пользователей с полями (user_id, name, username, avatar_basename) на которые
        подписаны на текущего пользователя (по его user_id)

        Примерный ответ:
        [
            {
                "user_id": 5
                "name": "name"
                "username": "biba"
                "avatar_basename": "qwerty123"
            },
            {
                "user_id": 7
                "name": "name"
                "username": "boba"
                "avatar_basename": "super_avatar"
            }
        ]
        """
        pass
