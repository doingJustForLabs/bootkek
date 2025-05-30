from typing import Optional

from pydantic import BaseModel, Field, ConfigDict

from api.enums import Sex, MuctrFaculties, Courses
from api.profiles.schemas import ProfileReadSummarySchema


class PaginationSchema(BaseModel):
    page: int = Field(1, gt=0)
    limit: int = Field(5, le=100, gt=0)


class FiltersSchema(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    course: Optional[Courses] = None
    sex: Optional[Sex] = None
    faculty: Optional[MuctrFaculties] = None


class SearchResponseSchema(BaseModel):
    profiles: list[ProfileReadSummarySchema]
    pagination: PaginationSchema
    total_profiles: int
    total_pages: int
