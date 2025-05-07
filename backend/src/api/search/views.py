from typing import Annotated

from fastapi import APIRouter, Depends

from api.auth.views import http_bearer
from api.search.schemas import PaginationSchema, FiltersSchema
from api.search.service import SearchService, get_search_service

router = APIRouter(
    tags=["Пользователи👨‍💻"], prefix="/profiles", dependencies=[Depends(http_bearer)]
)


@router.get("/search")
async def search_profiles(
    filters: Annotated[FiltersSchema, Depends()],
    pagination: Annotated[PaginationSchema, Depends()],
    search_service: Annotated[SearchService, Depends(get_search_service)],
):
    profiles = await search_service.search_profiles(pagination, filters)

    return profiles
