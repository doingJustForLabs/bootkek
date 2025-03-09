from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.params import Depends
from pyexpat.errors import messages
from starlette.websockets import WebSocketDisconnect

from api import get_routers
import uvicorn

from core.config import settings
from core.models.database import db_helper
from core.models.models import Base

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


app.mount("/static", StaticFiles(directory="static"), name="static")

@app.websocket("/items/{item_id}/ws")
async def websocket_endpoint(
        *,
        websocket: WebSocket,
        item_id: str,
        q: int | None = None,
        cookie_or_token: Annotated[str, Depends(get_cookie_or_token)],
):
    user_id = cookie_or_token
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()

            await manager.send_personal_message(
                f"Session cookie or query token value is: {cookie_or_token}",
                user_id,
            )
            if q is not None:
                await manager.send_personal_message(
                    f"Query parameter q is: {q}",
                user_id,
            )
            await manager.send_personal_message(
                f"Message text was: {data}, for item ID: {item_id}",
                user_id,
            )
    except WebSocketDisconnect:
        manager.disconnect(user_id)


@app.get('/')
def get_root():
    return {'message': 'Api is working!~!!'}



if __name__ == '__main__':
    uvicorn.run(app="src.main:app", reload=True, port=settings.run.port, host=settings.run.host)
