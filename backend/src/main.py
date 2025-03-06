from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import get_routers
import uvicorn

from core.config import settings
from core.models.database import db_helper
from core.models.models import Base

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

app.include_router(get_routers(), prefix='/api')


@app.get('/')
def get_root():
    return {'message': 'Api is working!~!!'}


if __name__ == '__main__':
    uvicorn.run(app="src.main:app", reload=True, port=settings.run.port, host=settings.run.host)
