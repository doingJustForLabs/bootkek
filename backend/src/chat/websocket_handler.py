from fastapi import WebSocket, WebSocketDisconnect
from chat.models import Chat, Message
from database.db import db_helper
import json
from chat.dependencies import verify_token

active_connections: dict = {}

async def handle_websocket(websocket: WebSocket, chat_id: int, token: str):
    await websocket.accept()

    user_id = None
    try:
        # Проверка токена (реализуем позже в зависимости от логики авторизации)
        user_id = await verify_token(token)
        if user_id is None:
            await websocket.close(code=1008, reason="Authentication failed")
            return

        # Добавляем пользователя в активные соединения
        if chat_id not in active_connections:
            active_connections[chat_id] = []
        active_connections[chat_id].append(websocket)

        # Ожидание сообщений
        while True:
            data = await websocket.receive_text()
            message_data = {
                "chat_id": chat_id,
                "user_id": user_id,
                "content": data
            }

            # Сохраняем сообщение в базе данных
            async with db_helper.session_getter() as session:
                new_message = Message(chat_id=chat_id, user_id=user_id, content=data)
                session.add(new_message)
                await session.commit()

            # Отправляем всем подключенным пользователям сообщение
            for connection in active_connections[chat_id]:
                await connection.send_text(f"User {user_id} says: {data}")
    except WebSocketDisconnect:
        active_connections[chat_id].remove(websocket)
        print(f"User {user_id} disconnected from chat {chat_id}.")
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close(code=1011, reason="Internal server error")


# # websocket_handler.py
# from fastapi import WebSocket
# import asyncio
#
# class WebSocketManager:
#     def __init__(self):
#         self.active_connections = set()
#
#     async def connect(self, websocket: WebSocket):
#         await websocket.accept()
#         self.active_connections.add(websocket)
#
#     def disconnect(self, websocket: WebSocket):
#         self.active_connections.remove(websocket)
#
#     async def broadcast(self, message: str):
#         for connection in self.active_connections:
#             await connection.send_text(message)