from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import db_helper
from database.repositories.chats import ChatRepository

chat_router = APIRouter()

# Получение всех чатов пользователя
@chat_router.get("/chats/{user_id}")
async def get_chats(user_id: int, db: AsyncSession = Depends(db_helper.session_getter)):
    chats = await ChatRepository.get_chats_for_user(db, user_id)
    return chats

# Создание нового чата
@chat_router.post("/chats")
async def create_chat(name: str, user_ids: List[int], db: AsyncSession = Depends(db_helper.session_getter)):
    new_chat = await ChatRepository.create_chat(db, name, user_ids)
    return {"message": "Chat created successfully!", "chat_id": new_chat.id}

# Получение сообщений чата
@chat_router.get("/chats/{chat_id}/messages")
async def get_messages(chat_id: int, db: AsyncSession = Depends(db_helper.session_getter)):
    messages = await ChatRepository.get_messages_in_chat(db, chat_id)
    return messages
