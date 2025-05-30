from typing import Optional, List


from sqlalchemy import select, insert, delete, asc, desc
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from api.exceptions import BadRequestException
from api.profiles.models import Profile
from api.skills.models import UsersSkill, Skills


class UserSkillsRepository:
    @classmethod
    async def add_skills(
        cls, session: AsyncSession, user_id: int, skills: list[str]
    ) -> None:

        try:
            result = await session.execute(
                select(Skills.id).where(Skills.skill_name.in_(skills))
            )
            skill_ids = [row[0] for row in result.all()]

            if not skill_ids:
                raise BadRequestException(f"Таких предметов нет {skill_ids}")

            insert_data = [
                {"user_id": user_id, "skill_id": skill_id} for skill_id in skill_ids
            ]

            await session.execute(insert(UsersSkill), insert_data)
            await session.commit()

        except IntegrityError as e:
            await session.rollback()
            print(f"[IntegrityError] Ошибка при добавлении скиллов: {e}")

        except SQLAlchemyError as e:
            await session.rollback()
            print(f"[SQLAlchemyError] Общая ошибка SQLAlchemy: {e}")

    @classmethod
    async def update_skills(
        cls, session: AsyncSession, user_id: int, skills: list[str]
    ) -> None:

        if skills is None:
            return

        result = await session.execute(
            select(Skills.id).where(Skills.skill_name.in_(skills))
        )
        skill_ids = {row[0] for row in result.all()}

        if not skill_ids and skills:  # Если user передал названия, но таких скиллов нет
            found_names = {
                row[0]
                for row in await session.execute(
                    select(Skills.skill_name).where(Skills.id.in_(list(skill_ids)))
                )
            }
            not_found_names = set(skills) - found_names
            if not_found_names:
                raise BadRequestException(
                    f"Следующие предметы не найдены в базе данных: {', '.join(not_found_names)}"
                )
            if not skills:
                pass
            else:  # Если skills не пуст, но incoming_skill_ids пуст (нет совпадений)
                raise BadRequestException(
                    f"Ни один из указанных предметов не найден в базе данных."
                )

        stmt_get_user_skills = select(UsersSkill.skill_id).where(
            UsersSkill.user_id == user_id
        )
        current_user_skill_ids_result = await session.execute(stmt_get_user_skills)
        current_user_skill_ids = {row[0] for row in current_user_skill_ids_result.all()}

        skills_to_add_ids = skill_ids - current_user_skill_ids
        skills_to_remove_ids = current_user_skill_ids - skill_ids

        if skills_to_add_ids:
            insert_data = [
                {"user_id": user_id, "skill_id": skill_id}
                for skill_id in skills_to_add_ids
            ]
            await session.execute(insert(UsersSkill), insert_data)

        if skills_to_remove_ids:
            delete_stmt = delete(UsersSkill).where(
                UsersSkill.user_id == user_id,
                UsersSkill.skill_id.in_(list(skills_to_remove_ids)),
            )
            await session.execute(delete_stmt)

        await session.commit()

    @staticmethod
    async def delete_skills(
        session: AsyncSession, user_id: int, skills: list[str]
    ) -> bool:
        if not skills:
            return False

        try:
            result = await session.execute(
                select(Skills.id).where(Skills.skill_name.in_(skills))
            )
            skill_ids = [row[0] for row in result.all()]

            if not skill_ids:
                return False

            stmt = delete(UsersSkill).where(
                UsersSkill.user_id == user_id, UsersSkill.skill_id.in_(skill_ids)
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
            print(f"[SQLAlchemyError] Ошибка при удалении скиллов: {e}")
            return False


async def get_filtered_profiles(
    session: AsyncSession,
    faculties: Optional[List[str]] = None,
    sexes: Optional[List[str]] = None,
    courses: Optional[List[int]] = None,
    sort_by_subscribers: Optional[str] = "desc",  # 'asc' или 'desc'
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
