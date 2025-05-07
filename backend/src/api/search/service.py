from typing import List

from api.profiles.models import ProfileRepository, Profile
from api.search.schemas import PaginationSchema, FiltersSchema
from database.repository import AbstractRepository


class SearchService:
    def __init__(self, profile_repo: type[AbstractRepository]):
        self.profile_repo = profile_repo()

    async def search_profiles(
        self,
        pagination: PaginationSchema,
        filters: FiltersSchema,
    ) -> List[Profile]:

        profiles = await self.profile_repo.find_all(
            filters=filters.model_dump(),
            limit=pagination.limit,
            offset=pagination.limit * pagination.page,
        )

        return profiles


def get_search_service():
    return SearchService(ProfileRepository)
