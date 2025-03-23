from fastapi import APIRouter

from .auth.views import router as auth_router
from .chat.views import router as chat_router

main_router = APIRouter(prefix="/api")

main_router.include_router(auth_router)
main_router.include_router(chat_router)