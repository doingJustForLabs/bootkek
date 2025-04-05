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

from fastapi import WebSocket, WebSocketDisconnect, Depends
import json
from api.chat.websocket_handler import handle_websocket
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

origins = ["http://localhost", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"]

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

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket, db: AsyncSession = Depends(db_helper.session_getter)):
    await websocket.accept()
    print("WebSocket connected")
    logging.debug("WebSocket connected")

    try:
        data = await websocket.receive_text()
        print(f"Received data: {data}")
        message_data = json.loads(data)

        token = message_data.get("token")
        chat_id = message_data.get("chatId")

        # Проверка данных
        if not token or not chat_id:
            error_message = "Token or chatId missing"
            print(error_message)
            await websocket.send_text(json.dumps({"error": error_message}))
            await websocket.close(code=1008, reason=error_message)
            return

        # Переадресуем обработку в отдельную функцию
        await handle_websocket(websocket, token, chat_id, db)
        print("WebSocket message handled")

    except json.JSONDecodeError:
        error_msg = "Invalid JSON data"
        logger.error(error_msg)
        await websocket.close(code=1008, reason=error_msg)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        await websocket.close(code=1011)


@app.get('/')
def get_root():
    return {"message": "Api is working!~!!"}


if __name__ == "__main__":
    uvicorn.run(
        app="src.main:app", reload=True, port=settings.run.port, host=settings.run.host
    )
