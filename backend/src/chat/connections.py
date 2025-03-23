from typing import List
from fastapi import WebSocket
from chat.models import Chat, Message, ChatUser
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import Session

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"Пользователь {user_id} подключен")

    async def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            print(f"Пользователь {user_id} отключен")

    async def broadcast(self, message: Message):
        for user_id, connections in self.active_connections.items():
            for websocket in connections:
                await websocket.send_text(f"Сообщение от {message.user_id}: {message.text}")

manager = ConnectionManager()