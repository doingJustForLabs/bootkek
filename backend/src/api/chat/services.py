import uuid

from fastapi import UploadFile
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from api.chat.models import Chat, Message, ChatUser
from api.exceptions import BadRequestException
from core.config import settings

class ChatRepository:
    _UPLOAD_DIR = settings.files.upload_dir  # Path('static/uploads')
    _ALLOWED_TYPES = {
        'image/jpeg', 'image/png',
        'application/pdf', 'text/plain',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    _MAX_SIZE = 10 * 1024 * 1024

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
    async def delete_chat_by_id(db: AsyncSession, chat_id: int) -> bool:
        chat = await db.get(Chat, chat_id)  # Используем db.get для простоты
        if chat:
            await db.delete(chat)
            await db.commit()  # Сохраняем изменения в базе данных
            return True
        return False

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
        session: AsyncSession,
            chat_id: int,
            limit: int = 100,
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

    @classmethod
    async def save_chat_file(
            cls,
            session: AsyncSession,
            file: UploadFile,
            chat_id: int,
            user_id: int
    ) -> dict:
        """Сохранение файла чата"""
        cls._validate_file(file)
        cls._ensure_upload_dir_exists()

        # Создаем папку чата, если не существует
        chat_dir = cls._UPLOAD_DIR / str(chat_id)
        chat_dir.mkdir(exist_ok=True)

        # Генерируем уникальное имя файла
        file_ext = Path(file.filename).suffix
        unique_name = f"{uuid.uuid4().hex}{file_ext}"
        file_path = chat_dir / unique_name

        # Сохраняем файл
        with file_path.open('wb') as buffer:
            buffer.write(await file.read())

        return {
            "path": f"uploads/{chat_id}/{unique_name}",  # Относительный путь
            "name": file.filename,
            "type": file.content_type,
            "size": file_path.stat().st_size
        }

    @classmethod
    def _validate_file(cls, file: UploadFile):
        if file.content_type not in cls._ALLOWED_TYPES:
            raise BadRequestException(
                f"Недопустимый тип файла. Разрешены: {', '.join(cls._ALLOWED_TYPES)}"
            )

        if file.size and file.size > cls._MAX_SIZE:
            raise BadRequestException(
                f"Превышен максимальный размер файла ({cls._MAX_SIZE // 1024 // 1024}MB)"
            )

    @classmethod
    def _ensure_upload_dir_exists(cls):
        cls._UPLOAD_DIR.mkdir(parents=True, exist_ok=True)