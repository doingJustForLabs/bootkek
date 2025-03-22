from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from websockets import connect

from api import main_router

# from fastapi.params import Depends
# from pyexpat.errors import messages
# from starlette.websockets import WebSocketDisconnect

# from api import get_routers

from core.config import settings
from core.security import security
from database.db import db_helper
from database.models import Base

from fastapi import WebSocket, WebSocketDisconnect, Query
from typing import List

from fastapi.responses import HTMLResponse
import os
from fastapi.staticfiles import StaticFiles
from chat.connections import manager
from chat.dependencies import verify_token

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

@app.get("/chat", response_class=HTMLResponse)
async def get_chat_page():
    with open(os.path.join("static", "chat.html"), encoding="utf-8") as f:
        return f.read()

active_connections: dict = {}

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    await websocket.accept()

    user_id = verify_token(token)
    if not user_id:
        await websocket.close(code=1008)
        return

    user_id_str = str(user_id)
    if user_id not in active_connections:
        active_connections[user_id_str] = []
    active_connections[user_id_str].append(websocket)

    await websocket.send_text(f"Добро пожаловать в чат, {user_id_str}!")

    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Эхо: {data}")
    except WebSocketDisconnect:
        active_connections[user_id_str].remove(websocket)
        if not active_connections[user_id_str]:
            del active_connections[user_id_str]

@app.get('/')
def get_root():
    return {"message": "Api is working!~!!"}


if __name__ == "__main__":
    uvicorn.run(
        app="src.main:app", reload=True, port=settings.run.port, host=settings.run.host
    )
