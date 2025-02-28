from fastapi import APIRouter

def get_routers() -> APIRouter:
    from .demo_auth.views import router as chill_auth_router

    router = APIRouter()
    router.include_router(chill_auth_router)
    return router
