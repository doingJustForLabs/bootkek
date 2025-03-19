from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api import main_router
from fastapi.params import Depends
from pyexpat.errors import messages
from starlette.websockets import WebSocketDisconnect

# from api import get_routers
import uvicorn

from core.config import settings
from core.security import security
from database.db import db_helper
from database.models import Base

from fastapi import WebSocket, Depends, status
from fastapi.responses import HTMLResponse
import os
from fastapi.staticfiles import StaticFiles
from typing import Annotated
from chat.connections import manager
from chat.dependencies import get_user_id_from_token
import jwt


@asynccontextmanager
async def lifespan(my_app: FastAPI):
    # startup
    async with db_helper.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield
    # shutdown
    print("Соединение с базой удалено")
    await db_helper.dispose()


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(main_router)

security.handle_errors(app)

app.mount("/static", StaticFiles(directory="static"), name="static")

# @app.get("/", response_class=HTMLResponse)
# async def get_login_page():
#     with open(os.path.join("static", "login.html")) as f:
#         return f.read()

@app.get("/chat", response_class=HTMLResponse)
async def get_chat_page():
    with open(os.path.join("static", "chat.html")) as f:
        return f.read()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(
        websocket: WebSocket,
        client_id: int,
        user_id: Annotated[str, Depends(get_user_id_from_token)]
        # token: Annotated[str, Depends(get_cookie_or_token)]
        ):
    # Убедимся, что user_id совпадает с client_id для безопасности
    if client_id != int(user_id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Подключаем пользователя
    await manager.connect(client_id, websocket)
    # await manager.broadcast(f"Client #{client_id} joined the chat", exclude=client_id)
    await manager.send_personal_message("Welcome to your private chat!", websocket)

    try:
        while True:
            # Получаем сообщение от клиента
            data = await websocket.receive_text()
            # Сообщение отправляется автору в виде "You wrote"
            await manager.send_personal_message(f"You wrote: {data}", websocket)
            # Рассылка другим пользователям
            # await manager.broadcast(f"#{client_id} says: {data}", exclude=client_id)
    except WebSocketDisconnect:
        # Отключаем клиента при разрыве соединения
        manager.disconnect(client_id)
        # await manager.broadcast(f"#{client_id} left the chat")

@app.get('/')
def get_root():
    return {"message": "Api is working!~!!"}


if __name__ == "__main__":
    uvicorn.run(
        app="src.main:app", reload=True, port=settings.run.port, host=settings.run.host
    )
