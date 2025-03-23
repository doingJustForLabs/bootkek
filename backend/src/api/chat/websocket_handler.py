from fastapi import WebSocket, WebSocketDisconnect
from api.chat.dependencies import verify_token
from database.db import db_helper
from database.models import Message

import json
active_connections: dict = {}

async def handle_websocket(websocket: WebSocket, token: str, chat_id: int):
    # await websocket.accept()

    user_id = None
    print(f"New WebSocket connection for chat_id: {chat_id}")
    try:
        print(f"New WebSocket connection for chat_id: {chat_id}")

        user_id = await verify_token(token)
        if user_id is None:
            print("Authentication failed: invalid token")
            await websocket.close(code=1008, reason="Authentication failed")
            return
        print(f"User {user_id} authenticated successfully")

        if chat_id not in active_connections:
            active_connections[chat_id] = []
        active_connections[chat_id].append(websocket)
        print(f"User {user_id} added to chat {chat_id}. Active connections: {len(active_connections[chat_id])}")

        async with db_helper.get_db_session() as session:
            while True:
                print("Waiting for message from WebSocket...")
                data = await websocket.receive_text()
                print(f"Received message from user {user_id}: {data}")
                # await websocket.send_text(f"Message received: {data}")

                # Сохраняем сообщение в базу данных
                new_message = Message(chat_id=chat_id, user_id=user_id, content=data)
                session.add(new_message)
                await session.commit()

                # Отправляем сообщение всем подключенным пользователям
                for connection in active_connections[chat_id]:
                    await connection.send_text(json.dumps({
                        "type": "user_message",
                        "username": f"User {user_id}",
                        "content": data
                    }))
                print(f"Message broadcasted to {len(active_connections[chat_id])} users in chat {chat_id}")

    except WebSocketDisconnect:
        if chat_id in active_connections:
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