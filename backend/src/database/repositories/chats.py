from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from api.chat.models import Chat, Message, ChatUser


class ChatRepository:

    @staticmethod
    async def create_chat(
        session: AsyncSession, name: str, user_ids: List[int]
    ) -> Chat:
        new_chat = Chat(name=name)
        session.add(new_chat)
        await session.flush()

        # Добавляем пользователей в чат
        for user_id in user_ids:
            existing = await session.execute(
                select(ChatUser).where(
                    ChatUser.chat_id == new_chat.id, ChatUser.user_id == user_id
                )
            )
            if not existing.scalar_one_or_none():
                chat_user = ChatUser(chat_id=new_chat.id, user_id=user_id)
                session.add(chat_user)

        await session.commit()
        # print(f"Chat with ID {new_chat.id} created successfully!")
        return new_chat

    @staticmethod
    async def get_chat_by_id(session: AsyncSession, chat_id: int) -> Optional[Chat]:
        result = await session.execute(
            select(Chat).filter(Chat.id == chat_id).options(selectinload(Chat.users))
        )
        return result.scalars().first()

    @staticmethod
    async def get_chats_for_user(session: AsyncSession, user_id: int) -> List[Chat]:
        result = await session.execute(
            select(Chat)
            .join(ChatUser)
            .filter(ChatUser.user_id == user_id)
            .options(selectinload(Chat.users))
        )
        return list(result.scalars())

    @staticmethod
    async def get_messages_in_chat(
        session: AsyncSession, chat_id: int, limit: int = 100
    ) -> List[Message]:
        result = await session.execute(
            select(Message)
            .filter(Message.chat_id == chat_id)
            .order_by(Message.timestamp.asc())
            .limit(limit)
        )
        return list(result.scalars())

    @staticmethod
    async def add_message_to_chat(
        session: AsyncSession, chat_id: int, user_id: int, content: str
    ) -> Message:
        message = Message(chat_id=chat_id, user_id=user_id, content=content)
        session.add(message)
        await session.commit()
        return message
