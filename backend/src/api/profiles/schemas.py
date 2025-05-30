from datetime import datetime
from typing import Optional, List

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_serializer,
)

from api.enums import Sex, MuctrFaculties, Courses, Skills
from api.skills.models import UsersSkill


class ProfileCreateSchema(BaseModel):
    model_config = ConfigDict(extra="forbid", use_enum_values=True)

    name: Optional[str] = Field(None, min_length=2, max_length=32)
    username: Optional[str] = Field(None, min_length=5, max_length=32)

    course: Optional[Courses] = None
    sex: Optional[Sex] = None
    faculty: Optional[MuctrFaculties] = None
    skills: Optional[List[Skills]] = None


class ProfileReadDetailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    name: Optional[str] = Field(None, min_length=2, max_length=32)
    username: Optional[str] = Field(None, min_length=5, max_length=32)

    course: Optional[Courses] = None
    sex: Optional[Sex] = None
    faculty: Optional[MuctrFaculties] = None
    avatar_basename: Optional[str] = None
    subscribers_count: int
    subscriptions_count: int
    skills: list

    create_date: datetime
    update_date: datetime

    @field_serializer("skills", when_used="always")
    def serialize_skills(self, skills: list["UsersSkill"]) -> list:
        return [s.skill.skill_name for s in skills]


class ProfileReadSummarySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    name: Optional[str] = Field(None, min_length=2, max_length=32)
    username: Optional[str] = Field(None, min_length=5, max_length=32)
    avatar_basename: Optional[str] = None
    skills: Optional[list] = None

    @field_serializer("skills", when_used="always")
    def serialize_skills(self, skills: list["UsersSkill"]) -> list:
        return [s.skill.skill_name for s in skills]


class ProfileResponseSchema(BaseModel):
    profile: ProfileReadDetailSchema


class ProfileResponseSearchSchema(BaseModel):
    profile: ProfileReadDetailSchema
    is_current_user: bool
    is_following: bool


class AvatarResponseSchema(BaseModel):
    basename: str
