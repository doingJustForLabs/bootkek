from fastapi import APIRouter

def get_routers() -> APIRouter:
    from .users import router as users_router

    router = APIRouter()
    router.include_router(users_router)
    return router
