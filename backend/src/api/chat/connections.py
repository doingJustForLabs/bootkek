from fastapi import WebSocket
from database.models import Message
import json


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}  # {chat_id: set(websocket1, websocket2)}
        self.user_sessions = {}      # {websocket: {"user_id": int, "chat_id": int}}

    async def connect(self, chat_id: int, user_id: int, websocket: WebSocket):
        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = {}
        self.active_connections[chat_id][user_id] = websocket
        self.user_sessions[websocket] = {"user_id": user_id, "chat_id": chat_id}

    def disconnect(self, websocket: WebSocket):
        session = self.user_sessions.get(websocket)
        if session:
            chat_id = session["chat_id"]
            user_id = session["user_id"]
            if chat_id in self.active_connections:
                if user_id in self.active_connections[chat_id]:
                    del self.active_connections[chat_id][user_id]
            del self.user_sessions[websocket]

    async def broadcast_except_sender(self, message: dict, chat_id: int, exclude_user_id: int = None):
        """Гарантируем правильную рассылку"""
        if chat_id not in self.active_connections:
            return

        for user_id, connection in self.active_connections[chat_id].items():
            if user_id == exclude_user_id:
                continue

            try:
                # Клонируем сообщение для каждого получателя
                user_message = json.loads(json.dumps(message))
                await connection.send_text(json.dumps(user_message))
            except Exception as e:
                self.disconnect(chat_id, connection)

# class ConnectionManager:
#     def __init__(self):
#         self.active_connections: dict = {}
#
#     async def connect(self, websocket: WebSocket, user_id: int):
#         if user_id not in self.active_connections:
#             self.active_connections[user_id] = []
#         self.active_connections[user_id].append(websocket)
#         # print(f"Пользователь {user_id} подключен")
#
#     async def disconnect(self, websocket: WebSocket, user_id: int):
#         if user_id in self.active_connections:
#             self.active_connections[user_id].remove(websocket)
#             if not self.active_connections[user_id]:
#                 del self.active_connections[user_id]
#             # print(f"Пользователь {user_id} отключен")
#
#     async def send_personal_message(self, message: str, user_id: int):
#         if user_id in self.active_connections:
#             await self.active_connections[user_id].send_text(message)
#
#     async def broadcast(self, message: Message):
#         # for user_id, connections in self.active_connections.items():
#         #     for websocket in connections:
#         #         await websocket.send_text(f"Сообщение от {message.user_id}: {message.content}")
#         for connection in self.active_connections.values():
#             await connection.send_text(message)

manager = ConnectionManager()