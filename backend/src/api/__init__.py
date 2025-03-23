from fastapi import APIRouter

from .auth.views import router as auth_router
from .profile.views import router as profile_router

main_router = APIRouter(prefix="/api")

main_router.include_router(auth_router)
main_router.include_router(profile_router)
