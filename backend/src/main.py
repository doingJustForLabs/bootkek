from contextlib import asynccontextmanager

import uvicorn
import os
import sys
from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import text
from redis import asyncio as aioredis

from limiter import limiter

sys.path.insert(1, os.path.join(sys.path[0], ".."))

from api import main_router
from api.exceptions import AppException
from api.dependencies import DbSession
from core.config import settings
from core.security import security
from database.db import db_helper


@asynccontextmanager
async def lifespan(_: FastAPI):
    # startup
    redis = aioredis.from_url("redis://localhost")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    yield

    # shutdown
    await db_helper.dispose()


app = FastAPI(
    title="Granite",
    version="0.10.3",
    lifespan=lifespan,
    default_response_class=ORJSONResponse,
)

app.include_router(main_router)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middleware

origins = ["http://localhost", "http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security.handle_errors(app)


@app.exception_handler(AppException)
def handle_not_found_error(request: Request, exc: AppException):
    return ORJSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.get("/")
@limiter.limit("5/minute")
def get_root(request: Request):
    return {"message": "Api is working!~!!"}


@app.get("/health-check")
async def get_database_version(session: DbSession):
    res = await session.execute(text("SELECT VERSION()"))
    return {"version": res.scalar()}


settings.files.avatar_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=settings.files.static_dir), name="static")

if __name__ == "__main__":
    uvicorn.run(
        app="src.main:app", reload=True, port=settings.run.port, host=settings.run.host
    )
