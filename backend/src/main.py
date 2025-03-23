from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api import main_router
# from api import get_routers
from core.config import settings
from core.security import security
from database.db import db_helper
from database.models import Base

from fastapi import WebSocket, WebSocketDisconnect, Query, Depends
from websockets.frames import CloseCode
from database.repositories.auth import UserAuthRepository
from database.db import DbSession
from typing import List
import json
from jose import JWTError
from chat.dependencies import verify_token
# from chat.models import Chat, Message
# from chat.connections import manager
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import HTMLResponse
import os
from fastapi.staticfiles import StaticFiles

@asynccontextmanager
async def lifespan(_: FastAPI):
    # startup
    async with db_helper.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield
    # shutdown
    await db_helper.dispose()


app = FastAPI(lifespan=lifespan)

app.include_router(main_router)

security.handle_errors(app)

origins = ["http://localhost", "http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security.handle_errors(app)


app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def get_login_page():
    with open(os.path.join("static", "login.html"), encoding="utf-8") as f:
        return f.read()

@app.get("/chats", response_class=HTMLResponse)
async def get_chats_page():
    with open(os.path.join("static", "chats.html"), encoding="utf-8") as f:
        return f.read()

active_chat_connections = {}

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket, session: AsyncSession = Depends(DbSession)):
    await websocket.accept()

    try:
        # Получаем первое сообщение с токеном
        while True:
            message_data = json.loads(await websocket.receive_text())
            token = message_data.get("token")

            # Проверяем токен
            if not token:
                await websocket.close(code=1008, reason="Token not provided")
                return

            user_id = await verify_token(token)

            if user_id is None:
                await websocket.close(code=1008, reason="Authentication failed")
                return

            # Получаем пользователя из базы
            user = await UserAuthRepository.get_user_by_user_id(session, user_id)
            if not user:
                await websocket.close(code=1008, reason="User not found")
                return

            # Сохраняем соединение в активных подключениях
            active_chat_connections[websocket] = {"user_id": user.id, "chatId": None}
            print(f"Пользователь {user.email} подключен.")

            # Дальше обрабатываем сообщения чатов
            data = await websocket.receive_text()
            message_data = json.loads(data)
            chat_id = message_data.get("chatId")

            # Обработка сообщения для конкретного чата
            if chat_id:
                active_chat_connections[websocket]["chatId"] = chat_id  # Устанавливаем chatId для этого подключения

                message = {
                    "username": user.email,
                    "content": message_data.get("content"),
                    "chatId": chat_id
                }

                # Отправляем в другие соединения этого чата
                for conn, chat_info in active_chat_connections.items():
                    if chat_info.get("chatId") == chat_id:
                        await conn.send_json(message)

    except WebSocketDisconnect:
        del active_chat_connections[websocket]
        print("Пользователь отключился")
    except JWTError:
        await websocket.close(code=1008, reason="Invalid token")
    except Exception as e:
        print(f"Ошибка: {e}")
        await websocket.close(code=1011, reason="Internal server error")


@app.get('/')
def get_root():
    return {"message": "Api is working!~!!"}


if __name__ == "__main__":
    uvicorn.run(
        app="src.main:app", reload=True, port=settings.run.port, host=settings.run.host
    )
