from typing import List

from api.profiles.models import Profile
from api.search.schemas import PaginationSchema, FiltersSchema

# from database.repository import AbstractRepository

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

from api.skills.models import UsersSkill, Skills


class SearchRepository:

    @classmethod
    async def search_profiles(
        cls,
        session: AsyncSession,
        keyword: str,
        pagination: PaginationSchema,
        filters: FiltersSchema,
    ) -> List[Profile]:
        profiles_query = (
            select(
                Profile.user_id,
                Profile.name,
                Profile.username,
                Profile.avatar_basename
            )
            .outerjoin(UsersSkill, Profile.user_id == UsersSkill.user_id)
            .outerjoin(Skills, UsersSkill.skill_id == Skills.id)
            .where(
                or_(
                    Skills.skill_name.ilike(f"%{keyword}%"),
                    Profile.name.ilike(f"%{keyword}%")
                )
            )
            .distinct()
            .limit(pagination.limit)
            .offset(pagination.page * pagination.limit)
        )

        # Второй запрос
        skills_query = (
            select(Profile.user_id, Skills.skill_name)
            .outerjoin(UsersSkill, Profile.user_id == UsersSkill.user_id)
            .outerjoin(Skills, UsersSkill.skill_id == Skills.id)
            .where(
                or_(
                    Skills.skill_name.ilike(f"%{keyword}%"),
                    Profile.name.ilike(f"%{keyword}%")
                )
            )
        )



        profiles_result = await session.execute(profiles_query)
        skills_result = await session.execute(skills_query)
        profiles_rows = profiles_result.fetchall()

        if not profiles_rows:
            print("пусто((")
            return []

        skills_rows = skills_result.all()

        skills_dict = {}
        current_user = None
        for user_id, skill_name in skills_rows:
            if user_id != current_user:
                skills_dict[user_id] = []
                current_user = user_id
            if len(skills_dict[user_id]) < 3:
                skills_dict[user_id].append(skill_name)

        # Собираем итоговый результат
        result = []
        for row in profiles_rows:
            user_id, name, username, avatar_basename = row
            result.append({
                "user_id": user_id,
                "name": name,
                "username": username,
                "avatar_basename": avatar_basename,
                "skills": skills_dict.get(user_id, [])
            })

        return result

