from enum import Enum
from typing import Optional

from fastapi import Query
from pydantic import BaseModel, ConfigDict, Field


class FileSize(int, Enum):
    size_64 = 64
    size_128 = 128
    size_256 = 256


class Sex(Enum):
    male: str = "male"
    female: str = "female"
    other: str = "other"


class MuctrFaculties(Enum):
    cithin: str = "ЦиТХИн"
    npm: str = "НПМ"
    hft: str = "ХФТ"
    ipur: str = "ИПУР"
    fen: str = "ФЕН"
    other: str = "other"


class ProfileSchema(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = Field(None, min_length=5)

    course: Optional[int] = Field(None, ge=1, le=4)
    sex: Optional[Sex] = None
    faculty: Optional[MuctrFaculties] = None

    model_config = ConfigDict(extra="forbid", use_enum_values=True)


class SearchParams(BaseModel):
    q: str = ""

    page: int = Field(0, ge=0)
    limit: int = Field(10, le=100, gt=0)
    order_by: str = "id"
    desc: bool = False
