from math import ceil
from typing import Optional
from typing import List, Optional

from api.profiles.models import Profile
from api.search.schemas import PaginationSchema, FiltersSchema
from api.chat.models import Chat, Message, ChatUser
from api.auth.models import User

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, aliased
from sqlalchemy.sql.elements import or_

from api.profiles.models import Profile
from api.profiles.schemas import ProfileReadSummarySchema
from api.search.schemas import PaginationSchema, FiltersSchema, SearchResponseSchema
from api.skills.models import UsersSkill, Skills
from sqlalchemy import select, func, or_, exists
from sqlalchemy.orm import selectinload, aliased


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

    @staticmethod
    async def search_chats_and_messages(
        session: AsyncSession,
        current_profile_id: int,
        keyword: Optional[str],
        pagination: PaginationSchema,
    ) -> tuple[List[Chat], List[Message]]:
        if not keyword:
            return [], []

        print(
            f"Поиск чатов и сообщений. Ключевое слово: '{keyword}', ID текущего профиля: {current_profile_id}"
        )

        current_user_subquery = (
            select(User.id)
            .join(Profile, User.id == Profile.user_id)
            .where(Profile.id == current_profile_id)
            .scalar_subquery()
            .correlate(Profile)  # Явно указываем корреляцию с таблицей Profile
        )

        other_user = aliased(User)
        other_profile = aliased(Profile)

        # Поиск личных чатов
        personal_chats_statement = (
            select(Chat)
            .join(ChatUser, ChatUser.chat_id == Chat.id)
            .join(other_user, other_user.id == ChatUser.user_id)
            .join(other_profile, other_profile.user_id == other_user.id)
            .options(selectinload(Chat.users))
            .where(
                # exists(
                #     select(ChatUser)
                #     .where(ChatUser.chat_id == Chat.id, ChatUser.user_id == current_user_subquery)
                #     .correlate(Chat)  # Явно указываем корреляцию с таблицей Chat основного запроса
                # ),
                or_(
                    other_profile.username.ilike(
                        f"{keyword}%"
                    ),  # Поиск по началу юзернейма
                    other_profile.name.ilike(f"{keyword}%"),  # Поиск по началу имени
                    other_profile.username.ilike(
                        f"%{keyword}%"
                    ),  # Поиск по содержимому юзернейма (дополнительно)
                    other_profile.name.ilike(
                        f"%{keyword}%"
                    ),  # Поиск по содержимому имени (дополнительно)
                ),
                # exists(
                #     select(ChatUser)
                #     .where(ChatUser.chat_id == Chat.id, ChatUser.user_id != current_user_subquery)
                #     .correlate(Chat)  # Явно указываем корреляцию с таблицей Chat основного запроса
                # ),
            )
            # .group_by(Chat.id)
            # .having(func.count(ChatUser.user_id) == 2)
        )
        print(f"Ключевое слово перед запросом: '{keyword}'")
        personal_chats = (
            (await session.execute(personal_chats_statement)).scalars().all()
        )
        personal_chats = [chat for chat in personal_chats if len(chat.users) == 2]

        # Поиск групповых чатов (исключая уже найденные личные)
        group_chats_statement = (
            select(Chat)
            .options(selectinload(Chat.users))
            .where(
                Chat.name.ilike(f"%{keyword}%"),
                Chat.id.notin_([pc.id for pc in personal_chats]),
            )
        )
        group_chats = (await session.execute(group_chats_statement)).scalars().all()
        group_chats = list(set(group_chats))

        # Поиск по содержимому сообщений в чатах, в которых участвует текущий пользователь
        message_statement = (
            select(Message)
            .join(Message.chat)
            .options(selectinload(Message.chat))
            .where(
                Message.content.ilike(f"%{keyword}%")
            )  # Поиск по содержимому сообщения
            .join(
                ChatUser, ChatUser.chat_id == Message.chat_id
            )  # Присоединяем таблицу связей чатов и пользователей
            .where(
                ChatUser.user_id == current_profile_id
            )  # Фильтруем сообщения только из чатов, где состоит текущий пользователь
            .order_by(Message.id, Message.timestamp.desc())
            .distinct(Message.id)  # Получаем только уникальные сообщения
            .limit(pagination.limit)
        )
        messages = list((await session.execute(message_statement)).scalars().all())

        # Получим последние 3 сообщения с совпадением для найденных чатов
        unique_chats = sorted(
            list(set(personal_chats + group_chats)),
            key=lambda chat: 1 if len(chat.users) == 2 else 2,
        )
        chats_with_matching_messages_list = []
        for chat in unique_chats:
            matching_messages_statement = (
                select(Message)
                .where(
                    Message.chat_id == chat.id, Message.content.ilike(f"%{keyword}%")
                )
                .order_by(Message.timestamp.desc())
                .limit(3)
            )
            matching_messages = (
                (await session.execute(matching_messages_statement)).scalars().all()
            )
            chats_with_matching_messages_list.append((chat, matching_messages))

        final_chats = [item[0] for item in chats_with_matching_messages_list]

        return final_chats, messages
