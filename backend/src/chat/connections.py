# connections.py
from typing import List, Dict
from fastapi import WebSocket, WebSocketException, status

from src.core.security import security


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.client_map: Dict[int, WebSocket] = {}  # Сопоставление client_id -> WebSocket

    async def connect(self, websocket: WebSocket, token: str = None):
        if not token:
            raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

        payload = security.decode_access_token(token)
        if not payload:
            raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

        user_id = payload.sub

        await websocket.accept()
        if user_id not in self.client_map:
            self.client_map[user_id] = websocket

        # Можно дополнительно добавить в активные подключения
        self.active_connections.append(websocket)

    def disconnect(self, user_id: int):
        websocket = self.client_map.pop(user_id, None)
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, exclude: int | None = None):
        for client_id, connection in self.client_map.items():
            if client_id != exclude:
                await connection.send_text(message)

manager = ConnectionManager()