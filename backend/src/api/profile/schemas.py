from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


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

    course: Optional[int] = Field(1, ge=1, le=4)
    sex: Optional[Sex] = None
    faculty: Optional[MuctrFaculties] = None

    model_config = ConfigDict(extra="forbid", use_enum_values=True)
