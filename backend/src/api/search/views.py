from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from api.search.schemas import PaginationSchema, FiltersSchema
from api.search.service import SearchRepository
from database.db import DbSession

router = APIRouter(tags=["Поиск🔎‍"], prefix="/search")


@router.get("")
async def search_profiles(
    session: DbSession,
    pagination: Annotated[PaginationSchema, Depends()],
    filters: Annotated[FiltersSchema, Depends()],
    keyword: Optional[str] = Query(description="Ищет по имени, юзернейму и скиллам"),
):
    profiles = await SearchRepository.search_profiles(
        session, keyword, pagination, filters
    )
    return profiles
