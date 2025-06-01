from typing import List, Optional

from api.profiles.models import Profile
from api.search.schemas import PaginationSchema, FiltersSchema
from api.chat.models import Chat, Message, ChatUser
from api.auth.models import User
# from database.repository import AbstractRepository

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload


class SearchRepository:

    @classmethod
    async def search_profiles(
        cls,
        session: AsyncSession,
        keyword: str,
        pagination: PaginationSchema,
        filters: FiltersSchema,
    ) -> List[Profile]:
        """
        SELECT (p.user_id, p.name, p.username, p.avatar_basename, skills)
        FROM profiles
        WHERE ... LIKE "%:keyword%"
        LIMIT :limit
        OFFSET :page * :limit
        ORDER BY user_id
        """

        # query = (
        #     select(
        #         Profile.name,
        #         Profile.username,
        #         Profile.avatar_basename,
        #     )x`
        #     .options(selectinload(Profile.skills))
        #     .where()
        #     .limit(pagination.limit)
        #     .offset(pagination.page * pagination.limit)
        # )

        return

    @staticmethod
    async def search_chats_and_messages(
            session: AsyncSession,
            current_profile_id: int,
            keyword: Optional[str],
            pagination: PaginationSchema
    ) -> tuple[List[Chat], List[Message]]:
        if not keyword:
            return [], []

        personal_chats = []
        group_chats = []

        current_user_subquery = (
            select(User.id)
            .where(Profile.id == current_profile_id)
            .scalar_subquery()
            .correlate(Profile)  # Явно указываем корреляцию с таблицей Profile
        )

        # Поиск личных чатов
        personal_chats_statement = (
            select(Chat)
            .join(Chat.users)
            .join(Profile)
            .options(selectinload(Chat.users))  # Явная загрузка пользователей
            .where(
                User.id.in_(current_user_subquery),
                Profile.username.ilike(f"%{keyword}%"),
                Chat.users.any(Profile.user_id != current_profile_id)
            )
        )

        personal_chats = (await session.execute(personal_chats_statement)).scalars().all()
        personal_chats = [chat for chat in personal_chats if len(chat.users) == 2]

        # Поиск групповых чатов (исключая уже найденные личные)
        group_chats_statement = (
            select(Chat)
            .options(selectinload(Chat.users))
            .where(
                Chat.name.ilike(f"%{keyword}%"),
                Chat.id.notin_([pc.id for pc in personal_chats])
            )
        )
        group_chats = (await session.execute(group_chats_statement)).scalars().all()
        group_chats = list(set(group_chats))

        # Поиск по содержимому сообщений в чатах, в которых участвует текущий пользователь
        message_statement = (
            select(Message)
            .join(Message.chat)
            .join(Chat.users)
            .options(selectinload(Message.chat))  # Явная загрузка связи 'chat'
            .where(
                Profile.id == current_profile_id,
                Message.content.ilike(f"%{keyword}%")
            )
            .order_by(Message.timestamp.desc())
            .limit(pagination.limit)
        )
        messages = list((await session.execute(message_statement)).scalars().all())

        # Получим последние 3 сообщения с совпадением для найденных чатов
        unique_chats = sorted(list(set(personal_chats + group_chats)), key=lambda chat: 1 if len(chat.users) == 2 else 2)
        chats_with_matching_messages_list = []
        for chat in unique_chats:
            matching_messages_statement = select(Message).where(
                Message.chat_id == chat.id,
                Message.content.ilike(f"%{keyword}%")
            ).order_by(Message.timestamp.desc()).limit(3)
            matching_messages = (await session.execute(matching_messages_statement)).scalars().all()
            chats_with_matching_messages_list.append((chat, matching_messages))

        final_chats = [item[0] for item in chats_with_matching_messages_list]

        return final_chats, messages