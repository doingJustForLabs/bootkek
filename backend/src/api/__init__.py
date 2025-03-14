from fastapi import APIRouter


def get_routers() -> APIRouter:
    from .users import router as users_router
    from .auth.views import router as auth_router

    router = APIRouter()
    router.include_router(users_router)
    router.include_router(auth_router)
    return router
