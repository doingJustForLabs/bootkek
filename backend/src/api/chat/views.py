import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Query
from typing import List, Optional

from fastapi.encoders import jsonable_encoder

# from select import select
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.responses import JSONResponse

from database.db import db_helper
from api.chat.services import ChatRepository
from api.auth.services import UserRepository
from api.profiles.services import ProfileRepository
from api.chat.models import Chat, Message

# from database.schemas.message_schemas import MessageResponse
from api.chat.schemas import CreateChatRequest
from api.profiles.models import Profile

import logging

logging.basicConfig(level=logging.DEBUG)

router = APIRouter(tags=["Chat↓нъ↑t"])


@router.get("/users")
async def get_users(db: AsyncSession = Depends(db_helper.session_getter)):
    users = await UserRepository.get_all_users(
        db
    )  # Этот метод должен возвращать всех пользователей
    return [{"id": user.id, "email": user.email} for user in users]


# Получение всех чатов пользователя
@router.get("/chats/{user_id}")
async def get_chats(
    user_id: int,
    db: AsyncSession = Depends(db_helper.session_getter),
    chat_id: Optional[int] = Query(
        None, description="ID конкретного чата для получения деталей"
    ),
):
    if chat_id:
        chat = await ChatRepository.get_chat_by_id(db, chat_id)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Чат с ID {chat_id} не найден.",
            )
        return chat
    else:
        chats = await ChatRepository.get_chats_for_user(db, user_id)
        return chats


# Создание нового чата
@router.post("/chats")
async def create_chat(
    chat_data: CreateChatRequest, db: AsyncSession = Depends(db_helper.session_getter)
):
    user_ids = chat_data.user_ids

    # Проверка, чтобы все пользователи были валидными
    profiles = []
    for user_id in chat_data.user_ids:
        user = await UserRepository.get_user_by_user_id(db, user_id)
        if not user:
            return {
                "success": False,
                "message": f"Пользователь с id {user_id} не найден",
            }
        # Подгружаем профиль пользователя
        profile_data = await db.execute(
            select(Profile).where(Profile.user_id == user_id)
        )
        profile = profile_data.scalar_one_or_none()
        profiles.append(profile)

    chat_name: Optional[str] = chat_data.name

    # личный чат
    if len(user_ids) == 2:
        chat_name = None

    new_chat = await ChatRepository.create_chat(db, chat_data.name, chat_data.user_ids)
    return {
        "message": "Chat created successfully!",
        "id": new_chat.id,
    }

    # except Exception as e:
    #     print(f"Error: {str(e)}")
    #     raise HTTPException(
    #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #         detail="Chat creation failed",
    #     )


# Получение сообщений чата
@router.get("/chats/{chat_id}/messages")
async def get_messages(
    chat_id: int, db: AsyncSession = Depends(db_helper.session_getter)
):
    messages = await ChatRepository.get_messages_in_chat(db, chat_id)
    return messages


#
@router.get("/chats/{user_id}/with_profiles")
async def get_user_chats_with_profiles(
    user_id: int,
    db: AsyncSession = Depends(db_helper.session_getter),
    chat_id: Optional[int] = Query(
        None, description="ID конкретного чата для получения деталей"
    ),
):
    if chat_id:
        chat = await ChatRepository.get_chat_by_id(db, chat_id)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Чат с ID {chat_id} не найден.",
            )

        participants_id = chat.users
        profiles = []
        for user in participants_id:
            profile = await ProfileRepository.get_profile_by_user_id(db, user.id)
            if profile:
                profiles.append(profile)

        chat_data = {
            "id": chat.id,
            "name": chat.name,
            "participants_profiles": [
                {
                    "user_id": profile.user_id,
                    "name": profile.name,
                    "username": profile.username,
                }
                for profile in profiles
            ],
        }
        return chat_data  # <--- ВОЗВРАЩАЕМ ОДИН ОБЪЕКТ

    chats = await ChatRepository.get_chats_for_user(db, user_id)
    chat_list_with_profiles = []
    for chat in chats:
        participants_id = chat.users
        profiles = []
        for user in participants_id:
            profile = await ProfileRepository.get_profile_by_user_id(db, user.id)
            if profile:
                profiles.append(profile)

        chat_data = {
            "id": chat.id,
            "name": chat.name,
            "participants_profiles": [
                {
                    "user_id": profile.user_id,
                    "name": profile.name,
                    "username": profile.username,
                }
                for profile in profiles
            ],
        }
        chat_list_with_profiles.append(chat_data)

    return chat_list_with_profiles


# @router.get("/chats/{chat_id}/messages")
# async def get_messages(chat_id: int, db: AsyncSession = Depends(db_helper.session_getter)):
#     messages = await ChatRepository.get_messages_in_chat(db, chat_id)
#
#     # Для каждого сообщения проверяем, есть ли файл и добавляем его данные в ответ
#     messages_with_files = []
#     for message in messages:
#         message_data = {
#             "id": message.id,
#             "chat_id": message.chat_id,
#             "user_id": message.user_id,
#             "content": message.content,
#             "timestamp": message.timestamp,
#         }
#         if message.file_path:
#             message_data["file"] = {
#                 "file_name": message.file_name,
#                 "file_path": message.file_path,
#                 "file_type": message.file_type,
#             }
#         messages_with_files.append(message_data)
#
#     return messages_with_files


# Добавление нового сообщения в чат
@router.post("/chats/{chat_id}/messages")
async def add_message(
    chat_id: int,
    content: str,
    user_id: int,
    db: AsyncSession = Depends(db_helper.session_getter),
):
    # Добавление нового сообщения в базу данных
    new_message = await ChatRepository.add_message_to_chat(
        db, chat_id, user_id, content
    )
    # Возвращаем новое сообщение
    return new_message


@router.post("/chats/{chat_id}/messages_with_file")
async def add_message_with_file(
    chat_id: int,
    user_id: int,
    content: str,
    file: UploadFile = File(...),  # добавляем поле для файла
    db: AsyncSession = Depends(db_helper.session_getter),
):
    # Проверка на наличие файла
    if file:
        # Указываем папку для хранения файлов
        upload_dir = Path("uploads")
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Генерируем уникальное имя для файла (например, используя его имя)
        file_location = upload_dir / file.filename

        # Сохраняем файл на сервере
        with file_location.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Добавляем информацию о сообщении в базу данных, включая путь к файлу
        new_message = Message(
            chat_id=chat_id,
            user_id=user_id,
            content=content,
            file_path=str(file_location),  # путь к файлу
            file_name=file.filename,  # имя файла
            file_type=file.content_type,  # тип файла (например, 'image/jpeg')
        )
        db.add(new_message)
        await db.commit()

        return JSONResponse(
            content={
                "message": "Message with file sent successfully!",
                "file_path": str(file_location),
            },
            status_code=200,
        )
    else:
        # Если файла нет, просто отправляем текстовое сообщение
        new_message = Message(
            chat_id=chat_id,
            user_id=user_id,
            content=content,
        )
        db.add(new_message)
        await db.commit()

        return JSONResponse(
            content={"message": "Message sent successfully without file"},
            status_code=200,
        )


@router.delete("/chats", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    chat_id: int, db: AsyncSession = Depends(db_helper.session_getter)
):
    chat_deleted = await ChatRepository.delete_chat_by_id(db, chat_id)

    if not chat_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Чат с ID {chat_id} не найден.",
        )

    return


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
