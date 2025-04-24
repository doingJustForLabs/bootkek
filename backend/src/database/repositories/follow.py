from datetime import datetime, timedelta
from typing import Optional

from pydantic import EmailStr
from sqlalchemy import select, and_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.exc import IntegrityError

from database.models import Profile, Follower


class FollowerService:
    @staticmethod
    async def subscribe(
            session: AsyncSession,
            follower_id: int,
            target_id: int
    ):
        # Проверка подписки на себя
        if follower_id == target_id:
            raise ValueError("Cannot subscribe to yourself, eblanchik")

        # Проверка существующей подписки
        existing = await session.scalar(
            select(Follower).where(
                and_(
                    Follower.follower_id == follower_id,
                    Follower.target_id == target_id
                )
            )
        )

        if existing:
            raise ValueError("Subscription already exists, ueban")

        try:
            # Создаем новую подписку
            new_follow = Follower(
                follower_id=follower_id,
                target_id=target_id,
                created_at=datetime.now()
            )
            session.add(new_follow)

            # Обновляем счетчики
            await FollowerService._update_profile_counts(
                session, follower_id, target_id, increment=True
            )

            await session.commit()
            return new_follow

        except IntegrityError:
            await session.rollback()
            raise ValueError("One of the users doesn't exist")

    @staticmethod
    async def unsubscribe(
            session: AsyncSession,
            follower_id: int,
            target_id: int
    ) -> bool:
        follow = await session.scalar(
            select(Follower).where(
                and_(
                    Follower.follower_id == follower_id,
                    Follower.target_id == target_id
                )
            )
        )

        if not follow:
            return False

        await session.delete(follow)
        await FollowerService._update_profile_counts(
            session, follower_id, target_id, increment=False
        )
        await session.commit()
        return True

    @staticmethod
    async def _update_profile_counts(
            session: AsyncSession,
            follower_id: int,
            target_id: int,
            increment: bool
    ) -> None:
        change = 1 if increment else -1

        # Обновляем счетчик подписчиков у target
        await session.execute(
            update(Profile)
            .where(Profile.id == target_id)
            .values(subscribers_count=Profile.subscribers_count + change)
        )

        # Обновляем счетчик подписок у follower
        await session.execute(
            update(Profile)
            .where(Profile.id == follower_id)
            .values(subscriptions_count=Profile.subscriptions_count + change)
        )
