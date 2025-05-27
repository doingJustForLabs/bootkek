from fastapi import APIRouter

from .auth.views import router as auth_router
from .profiles.views import router as profile_router
from .search.views import router as search_router
from .followers.views import router as follower_router
from .enums.views import router as enum_router

main_router = APIRouter(prefix="/api")

main_router.include_router(auth_router)
main_router.include_router(profile_router)
main_router.include_router(search_router)
main_router.include_router(follower_router)
main_router.include_router(enum_router)
