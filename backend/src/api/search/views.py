from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from api.auth.views import http_bearer, AccessDependency
from api.search.schemas import PaginationSchema, FiltersSchema
from api.search.service import SearchRepository
from database.db import DbSession

# from api.search.service import SearchService, get_search_service

router = APIRouter(
    tags=["Пользователи👨‍💻"], prefix="/profiles", dependencies=[Depends(http_bearer)]
)


@router.get("/search")
async def search_profiles(
    session: DbSession,
    token: AccessDependency,
    pagination: Annotated[PaginationSchema, Depends()],
    filters: Annotated[FiltersSchema, Depends()],
    keyword: Optional[str] = Query(description="Ищет по имени, юзернейму и скиллам"),
):
    profiles = await SearchRepository.search_profiles(
        session, keyword, pagination, filters
    )
    return profiles
