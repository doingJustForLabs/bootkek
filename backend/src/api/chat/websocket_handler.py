from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.testing.suite.test_reflection import users

from api.chat.dependencies import verify_token
from database.db import db_helper
from sqlalchemy.ext.asyncio import AsyncSession
from api.chat.models import Message
from api.chat.connections import manager
from datetime import datetime
from database.schemas.message_schemas import MessageResponse

import json
import logging

logger = logging.getLogger(__name__)

active_connections: dict = {}


async def handle_websocket(
    websocket: WebSocket, token: str, chat_id: int, db: AsyncSession
):
    """Основной обработчик WebSocket соединения для чата"""
    user_id = 0
    try:
        # Аутентификация пользователя
        user_id = await verify_token(token)
        if not user_id:
            await websocket.send_json({"error": "Invalid token"})
            await websocket.close(code=1008)
            return

        # 4. Подтверждаем успешное подключение
        await websocket.send_json(
            {"type": "connection_ack", "status": "authenticated", "userId": user_id}
        )

        logger.info(f"User {user_id} connected to chat {chat_id}")

        # Добавляем соединение в менеджер
        await manager.connect(chat_id=chat_id, user_id=user_id, websocket=websocket)

        # Отправляем историю сообщений
        await send_chat_history(chat_id, websocket, db)

        # Основной цикл обработки сообщений
        while True:
            message_data = await websocket.receive_text()
            logger.debug(f"Message from user {user_id}: {message_data}")

            try:
                message_json = json.loads(message_data)
                await process_chat_message(
                    message_json, user_id, chat_id, db, websocket
                )
            except json.JSONDecodeError:
                logger.error("Invalid message format")
                await websocket.send_json({"error": "Invalid message format"})

    except WebSocketDisconnect:
        logger.info(f"User {user_id} disconnected from chat {chat_id}")
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket)
        await websocket.close(code=1011)
    finally:
        await db.close()


async def send_chat_history(chat_id: int, websocket: WebSocket, db: AsyncSession):
    """Отправка истории сообщений чата"""
    messages = await db.execute(
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(Message.timestamp.asc())
        .limit(100)
    )
    messages = messages.scalars().all()

    for message in messages:
        await websocket.send_json(
            {
                "type": "chat_message",
                "data": {
                    "id": message.id,
                    "content": message.content,
                    "user_id": message.user_id,
                    "timestamp": message.timestamp.isoformat(),
                },
            }
        )


async def process_chat_message(
    message_data: dict,
    user_id: int,
    chat_id: int,
    db: AsyncSession,
    websocket: WebSocket,
):
    """Обработка входящего сообщения чата"""
    if not message_data.get("content"):
        await websocket.send_json({"error": "Message content is required"})
        return

    temp_id = message_data.get("tempId")

    try:
        # Временное подтверждение
        if temp_id:
            await websocket.send_json(
                {
                    "type": "message_temp_ack",
                    "tempId": temp_id,
                    "status": "sending",
                    "user_id": user_id,  # Добавляем отправителя
                }
            )

        # Сохраняем сообщение в БД
        new_message = Message(
            chat_id=chat_id,
            user_id=user_id,
            content=message_data["content"],
        )
        db.add(new_message)
        await db.commit()
        await db.refresh(new_message)

        # Формируем ответ
        response = {
            "type": "chat_message",
            "data": {
                "id": new_message.id,
                "content": new_message.content,
                "user_id": user_id,  # Важно: используем ID из БД
                "timestamp": new_message.timestamp.isoformat(),
                "status": "delivered",
            },
        }

        # if temp_id:
        #     response["data"]["tempId"] = temp_id

        # Отправляем подтверждение отправителю
        if temp_id:
            await websocket.send_json(
                {
                    "type": "message_confirmation",
                    "tempId": temp_id,
                    "messageId": new_message.id,
                    "status": "delivered",
                    "user_id": user_id,  # Добавляем отправителя
                }
            )

        # Рассылаем всем, кроме отправителя
        await manager.broadcast_except_sender(
            message=response, chat_id=chat_id, exclude_user_id=user_id
        )

    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        if temp_id:
            await websocket.send_json(
                {
                    "type": "message_status",
                    "tempId": temp_id,
                    "status": "failed",
                    "error": str(e),
                    "user_id": user_id,
                }
            )

    # user_id = None
    # print(f"New WebSocket connection for chat_id: {chat_id}")
    # try:
    #     user_id = await verify_token(token)
    #     if not user_id:
    #         logger.error("Authentication failed: invalid token")
    #         await websocket.close(code=1008)
    #         return
    #     logger.info(f"User {user_id} authenticated for chat {chat_id}")
    #
    #     await manager.connect(chat_id, websocket)
    #
    #     while True:
    #         data = await websocket.receive_text()
    #         logger.debug(f"Received message from user {user_id}: {data}")
    #         current_time = datetime.utcnow()
    #         # Сохраняем сообщение в БД
    #         new_message = Message(
    #             chat_id=chat_id,
    #             user_id=user_id,
    #             content=data,
    #             timestamp=current_time
    #         )
    #         db.add(new_message)
    #         await db.commit()
    #         await db.refresh(new_message)
    #
    #         message_response = MessageResponse.model_validate(new_message)
    #
    #         # Формируем полное сообщение для рассылки
    #         ws_message = {
    #             "type": "chat_message",
    #             "data": message_response.dict()
    #         }
    #
    #         # Рассылаем всем участникам чата
    #         await manager.broadcast(
    #             json.dumps(ws_message),
    #             chat_id
    #         )
    #
    # except WebSocketDisconnect:
    #     logger.info(f"User {user_id} disconnected from chat {chat_id}")
    #     manager.disconnect(chat_id, websocket)
    # except Exception as e:
    #     logger.error(f"Error in WebSocket: {str(e)}")
    #     await websocket.close(code=1011)
    # finally:
    #     await db.close()
