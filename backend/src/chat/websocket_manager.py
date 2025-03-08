


# # websocket_manager.py
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