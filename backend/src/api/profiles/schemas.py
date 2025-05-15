from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

from api.enums import Sex, MuctrFaculties
from api.exceptions import BadRequestException

alf = [chr(i) for i in range(ord("a"), ord("z") + 1)]
nums = [str(i) for i in range(10)]


class ProfileCreateSchema(BaseModel):
    model_config = ConfigDict(extra="forbid", use_enum_values=True)

    name: Optional[str] = Field(None, min_length=2, max_length=32)
    username: Optional[str] = Field(None, min_length=5, max_length=32)

    course: Optional[int] = Field(None, ge=1, le=4)
    sex: Optional[Sex] = None
    faculty: Optional[MuctrFaculties] = None

    @model_validator(mode="after")
    def validate_username(self):
        if self.username:
            if any(let not in "".join(alf + nums) for let in self.username.lower()):
                raise BadRequestException(
                    "Невалидный юзернейм. Use (0-9) and (a-z, A-Z)"
                )
            return self
        return self


class ProfileReadDetailSchema(ProfileCreateSchema):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    avatar_basename: Optional[str] = None
    subscribers_count: int
    subscriptions_count: int

    create_date: datetime
    update_date: datetime


class ProfileReadSummarySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    name: Optional[str] = Field(None, min_length=2, max_length=32)
    username: Optional[str] = Field(None, min_length=5, max_length=32)
    avatar_basename: Optional[str] = None


class ProfileResponseSchema(BaseModel):
    profile: ProfileReadDetailSchema


class ProfileResponseSearchSchema(BaseModel):
    profile: ProfileReadDetailSchema
    is_current_user: bool
    is_following: bool


class AvatarResponseSchema(BaseModel):
    basename: str
