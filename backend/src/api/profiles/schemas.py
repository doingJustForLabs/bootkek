from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, Field, model_validator

from api.enums import Sex, MuctrFaculties
from api.exceptions import BadRequestException

alf = [chr(i) for i in range(ord("a"), ord("z") + 1)]
nums = [str(i) for i in range(10)]


class ProfileCreateSchema(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = Field(None, min_length=5, max_length=25)

    course: Optional[int] = Field(None, ge=1, le=4)
    sex: Optional[Sex] = None
    faculty: Optional[MuctrFaculties] = None

    model_config = ConfigDict(extra="forbid", use_enum_values=True)

    @model_validator(mode="after")
    def validate_username(self):
        if self.username:
            if any(let not in "".join(alf + nums) for let in self.username.lower()):
                raise BadRequestException("Невалидный юзернейм. Use (0-9) and (a-z, A-Z)")
            return self
        return self


class ProfileDetailDataSchema(BaseModel):
    name: str
    username: str
    sex: Optional[str] = None
    faculty: Optional[str] = None
    course: Optional[int] = None
    avatar_basename: Optional[str] = None

    subscribers_count: int
    subscriptions_count: int

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

class SearchUserSchema(BaseModel):
    profile: ProfileDetailDataSchema
    is_current_user: bool
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


class SearchFilters(BaseModel):
    q: Optional[str] = None
    skill: Optional[str] = None
