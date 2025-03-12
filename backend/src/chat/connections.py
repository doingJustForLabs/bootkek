# connections.py
from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.client_map: Dict[int, WebSocket] = {}  # Сопоставление client_id -> WebSocket

    async def connect(self, client_id: int,websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.client_map[client_id] = websocket  # Привязываем ID к WebSocket

    def disconnect(self, client_id: int):
        websocket = self.client_map.pop(client_id, None)
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, exclude: int | None = None):
        for client_id, connection in self.client_map.items():
            if client_id != exclude:
                await connection.send_text(message)

manager = ConnectionManager()