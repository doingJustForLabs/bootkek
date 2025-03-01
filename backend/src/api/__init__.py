from fastapi import APIRouter

def get_routers() -> APIRouter:
    from .demo_auth.views import router as chill_auth_router
    from .users import router as users_router

    router = APIRouter()
    router.include_router(chill_auth_router)
    router.include_router(users_router)
    return router
