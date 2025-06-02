from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from fastapi_cache.decorator import cache

from api.search.schemas import PaginationSchema, FiltersSchema, SearchResponseSchema
from api.search.service import SearchRepository
from database.db import DbSession

router = APIRouter(tags=["Поиск🔎‍"], prefix="/search")


@cache(expire=300)
@router.get("", response_model=SearchResponseSchema)
async def search_profiles(
    session: DbSession,
    pagination: Annotated[PaginationSchema, Depends()],
    filters: Annotated[FiltersSchema, Depends()],
    keyword: Optional[str] = Query(
        None, description="Ищет по имени, юзернейму и скиллам"
    ),
):
    profiles = await SearchRepository.search_profiles(
        session, keyword, pagination, filters
    )
    return profiles
