from typing import Type
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, and_, update
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from api.profiles.models import Follower, Profile
from repositories.follower import FollowerRepository

class FollowerService:
    def __init__(self, follower_repo: Type[FollowerRepository]):
        self.follower_repo = follower_repo()

    async def subscribe(self, session: AsyncSession, follower_id: int, target_id: int) -> Follower:
        if follower_id == target_id:
            raise ValueError("Нельзя подписаться на самого себя")

        existing = await session.scalar(
            select(Follower).where(
                and_(
                    Follower.follower_id == follower_id,
                    Follower.target_id == target_id
                )
            )
        )

        if existing:
            raise ValueError("Подписка уже существует")

        try:
            new_follow = Follower(
                follower_id=follower_id,
                target_id=target_id,
                created_at=datetime.utcnow()
            )
            session.add(new_follow)

            await self._update_profile_counts(session, follower_id, target_id, increment=True)
            await session.commit()
            return new_follow

        except IntegrityError:
            await session.rollback()
            raise ValueError("Пользователь не найден")

    async def unsubscribe(self, session: AsyncSession, follower_id: int, target_id: int) -> bool:
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
        await self._update_profile_counts(session, follower_id, target_id, increment=False)
        await session.commit()
        return True

    async def _update_profile_counts(self, session: AsyncSession, follower_id: int, target_id: int, increment: bool) -> None:
        change = 1 if increment else -1

        await session.execute(
            update(Profile).where(Profile.id == target_id)
            .values(subscribers_count=Profile.subscribers_count + change)
        )
        await session.execute(
            update(Profile).where(Profile.id == follower_id)
            .values(subscriptions_count=Profile.subscriptions_count + change)
        )
