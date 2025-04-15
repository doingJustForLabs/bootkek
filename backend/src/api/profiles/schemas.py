from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, Field

from api.profiles.enum import Sex, MuctrFaculties


class ProfileCreateSchema(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = Field(None, min_length=5)

    course: Optional[int] = Field(None, ge=1, le=4)
    sex: Optional[Sex] = None
    faculty: Optional[MuctrFaculties] = None

    model_config = ConfigDict(extra="forbid", use_enum_values=True)


class ProfileDetailDataSchema(BaseModel):
    name: str
    username: str
    sex: str
    faculty: str
    avatar_basename: str
    update_date: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfileSummaryDataSchema(BaseModel):
    user_id: int
    name: str
    username: str
    avatar_basename: str

    model_config = ConfigDict(from_attributes=True)


class ProfileDetailResponseSchema(BaseModel):
    profile: ProfileDetailDataSchema

    model_config = ConfigDict(from_attributes=True)


class PaginationSchema(BaseModel):
    page: int = Field(0, ge=0)
    limit: int = Field(10, le=100, gt=0)


class SearchParams(BaseModel):
    q: str = ""
    order_by: str = "id"
    desc: bool = False


class SearchResponseSchema(BaseModel):
    profiles: List[ProfileSummaryDataSchema]
    filters: SearchParams
    pagination: PaginationSchema
