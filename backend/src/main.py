from contextlib import asynccontextmanager

from fastapi import FastAPI
from api import get_routers
import uvicorn

from core.config import settings
from core.models.database import db_helper
from core.models.models import Base

from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from chat.connections import manager


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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print(websocket.url.path)
    print(websocket.url.port)
    print(websocket.url.scheme)

    await manager.connect(websocket)
    while True:
        try:
          data = await websocket.receive_text()
          await manager.broadcast({data})
        except Exception as e:
          print('error: ', e)
          break

@app.get('/')
def get_root():
    return {'message': 'Api is working!~!!'}



if __name__ == '__main__':
    uvicorn.run(app="src.main:app", reload=True, port=settings.run.port, host=settings.run.host)
