from typing import Optional, List


from sqlalchemy import select, insert, where, delete, asc, desc
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from api.profiles.models import Profile
from api.skills.models import UsersSkill


class UserSkillsRepository:
    @staticmethod
    async def add_skills(session: AsyncSession, user_id: int, skill_ids: list[int]) -> bool:
        if not skill_ids:
            return False

        try:
            insert_data = [
                {"user_id": user_id, "skill_id": skill_id}
                for skill_id in skill_ids
            ]

            await session.execute(insert(UsersSkill), insert_data)
            await session.commit()
            return True

        except IntegrityError as e:
            await session.rollback()
            print(f"[IntegrityError] Ошибка при добавлении скиллов: {e}")
            return False

        except SQLAlchemyError as e:
            await session.rollback()
            print(f"[SQLAlchemyError] Общая ошибка SQLAlchemy: {e}")
            return False

    @staticmethod
    async def delete_skill(session: AsyncSession, user_id: int, skill_id: int) -> bool:
        try:
            stmt = delete(UsersSkill).where(
                UsersSkill.user_id == user_id,
                UsersSkill.skill_id == skill_id
            )
            result = await session.execute(stmt)

            if result.rowcount() > 0:
                await session.commit()
                return True
            else:
                await session.rollback()
                return False

        except SQLAlchemyError as e:
            await session.rollback()
            print(f"[SQLAlchemyError] Ошибка при удалении скилла: {e}")
            return False

async def get_filtered_profiles(
    session: AsyncSession,
    faculties: Optional[List[str]] = None,
    sexes: Optional[List[str]] = None,
    courses: Optional[List[int]] = None,
    sort_by_subscribers: Optional[str] = "desc"  # 'asc' или 'desc'
):
    query = select(Profile)

    if faculties:
        query = query.where(Profile.faculty.in_(faculties))

    if sexes:
        query = query.where(Profile.sex.in_(sexes))

    if courses:
        query = query.where(Profile.course.in_(courses))

    # Сортировка по количеству подписчиков
    if sort_by_subscribers == "asc":
        query = query.order_by(asc(Profile.subscribers_count))
    else:
        query = query.order_by(desc(Profile.subscribers_count))

    result = await session.execute(query)
    return result.scalars().all()