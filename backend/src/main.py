from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from api import main_router
from core.config import settings
from core.security import security
from database.db import db_helper, Base


@asynccontextmanager
async def lifespan(_: FastAPI):
    # startup
    async with db_helper.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    # shutdown
    await db_helper.dispose()


app = FastAPI(title="Granite", lifespan=lifespan)

app.include_router(main_router)
security.handle_errors(app)

app.mount("/static", StaticFiles(directory=settings.files.static_dir), name="static")


# Middleware

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def get_root():
    return {"message": "Api is working!~!!"}


if __name__ == "__main__":
    uvicorn.run(
        app="src.main:app", reload=True, port=settings.run.port, host=settings.run.host
    )
