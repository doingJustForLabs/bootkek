from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import db_helper
from database.repositories.chats import ChatRepository
from database.repositories.auth import UserAuthRepository
from database.models import Chat, Message
# from database.schemas.message_schemas import MessageResponse

router = APIRouter()

@router.get("/users")
async def get_users(db: AsyncSession = Depends(db_helper.session_getter)):
    users = await UserAuthRepository.get_all_users(db)  # Этот метод должен возвращать всех пользователей
    return [{"id": user.id, "email": user.email} for user in users]

# Получение всех чатов пользователя
@router.get("/chats/{user_id}")
async def get_chats(user_id: int, db: AsyncSession = Depends(db_helper.session_getter)):
    chats = await ChatRepository.get_chats_for_user(db, user_id)
    return chats

# Создание нового чата
@router.post("/chats")
async def create_chat(name: str, user_ids: List[int], db: AsyncSession = Depends(db_helper.session_getter)):
    # Проверка, чтобы все пользователи были валидными

    for user_id in user_ids:
        user = await UserAuthRepository.get_user_by_user_id(db, user_id)
        if not user:
            return {"success": False, "message": f"Пользователь с id {user_id} не найден"}

    new_chat = await ChatRepository.create_chat(db, name, user_ids)
    return {"message": "Chat created successfully!", "chat_id": new_chat.id}


# Получение сообщений чата
@router.get("/chats/{chat_id}/messages")
async def get_messages(chat_id: int, db: AsyncSession = Depends(db_helper.session_getter)):
    messages = await ChatRepository.get_messages_in_chat(db, chat_id)
    return messages


# Добавление нового сообщения в чат
@router.post("/chats/{chat_id}/messages")
async def add_message(chat_id: int, content: str, user_id: int, db: AsyncSession = Depends(db_helper.session_getter)):
    # Добавление нового сообщения в базу данных
    new_message = await ChatRepository.add_message_to_chat(db, chat_id, user_id, content)

    # Возвращаем новое сообщение
    return new_message

# @router.post("/create_chat")
# async def create_chat(users: list, db: AsyncSession = Depends(db_helper.session_getter)):
#     # Проверка, чтобы все пользователи были валидными
#     for user_id in users:
#         user = await UserAuthRepository.get_user_by_user_id(db, user_id)
#         if not user:
#             return {"success": False, "message": f"Пользователь с id {user_id} не найден"}
#
#     # Создание чата
#     new_chat = Chat(users=users)  # Здесь предполагаем, что chat имеет поле users как список ID пользователей
#     db.add(new_chat)
#     await db.commit()
#
#     return {"success": True, "chatId": new_chat.id}