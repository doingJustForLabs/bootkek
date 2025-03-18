from fastapi import APIRouter

from .auth.views import router as auth_router
from .users import router as users_router

main_router = APIRouter(prefix='/api')

main_router.include_router(auth_router)
main_router.include_router(users_router)
