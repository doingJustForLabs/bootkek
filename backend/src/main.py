from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from api import main_router
from api.exceptions import AppException
from core.config import settings
from core.security import security
from database.db import db_helper


@asynccontextmanager
async def lifespan(_: FastAPI):
    # startup

    yield

    # shutdown
    await db_helper.dispose()


app = FastAPI(
    title="Granite",
    lifespan=lifespan,
    default_response_class=ORJSONResponse,
)

app.include_router(main_router)

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
def get_root():
    return {"message": "Api is working!~!!"}


app.mount("/static", StaticFiles(directory=settings.files.static_dir), name="static")


if __name__ == "__main__":
    uvicorn.run(
        app="src.main:app", reload=True, port=settings.run.port, host=settings.run.host
    )
