from datetime import datetime, timedelta
from sqlite3 import IntegrityError
from typing import Optional, Dict, List

from pydantic import EmailStr
from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import User, UserSession, Profile, Posts, Subjects


class UserPostsRepository:
    @staticmethod
    async def create_post(session: AsyncSession, user_id, subject_id, description):
        session.add(Posts(
            user_id=user_id,
            subject_id=subject_id,
            description=description
        ))
        await session.commit()
    @staticmethod
    async def delete_post(session: AsyncSession, post_id):
        post = await session.get(Posts, post_id)

        if post:
            await session.delete(post)
            await session.commit()
            return True
        return False
    @staticmethod
    async def update_post(session: AsyncSession, post_id, subject_id, description):
        post = await session.get(Posts, post_id)

        if post:
            post.subject_id = subject_id
            post.description = description

            await session.commit()
            return True
        return False