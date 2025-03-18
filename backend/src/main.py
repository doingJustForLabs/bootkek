from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.params import Depends
from pyexpat.errors import messages
from starlette.websockets import WebSocketDisconnect

from api import get_routers
import uvicorn

from core.config import settings
from core.security import security
from database.db import db_helper
from database.models import Base

from fastapi import WebSocket, Depends
# from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from typing import Annotated
from chat.connections import manager
from chat.dependencies import get_cookie_or_token


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

app.include_router(get_routers(), prefix='/api')

security.handle_errors(app)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(
        websocket: WebSocket,
        client_id: int,
        token: Annotated[str, Depends(get_cookie_or_token)]
        ):
    # Подключаем пользователя
    await manager.connect(client_id, websocket)
    await manager.broadcast(f"Client #{client_id} joined the chat with token: {token}", exclude=client_id)

    try:
        while True:
            # Получаем сообщение от клиента
            data = await websocket.receive_text()
            # Сообщение отправляется автору в виде "You wrote"
            await manager.send_personal_message(f"You wrote: {data}", websocket)
            # Рассылка другим пользователям
            await manager.broadcast(f"#{client_id} says: {data}", exclude=client_id)
    except WebSocketDisconnect:
        # Отключаем клиента при разрыве соединения
        manager.disconnect(client_id)
        await manager.broadcast(f"#{client_id} left the chat")

@app.get('/')
def get_root():
    return {"message": "Api is working!~!!"}


if __name__ == "__main__":
    uvicorn.run(
        app="src.main:app", reload=True, port=settings.run.port, host=settings.run.host
    )
