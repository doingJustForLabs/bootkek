from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

from api.enums import Sex, MuctrFaculties


class PaginationSchema(BaseModel):
    page: int = Field(0, ge=0)
    limit: int = Field(5, le=100, gt=0)


class FiltersSchema(BaseModel):
    course: Optional[int] = Field(None, ge=1, le=4)
    sex: Optional[Sex] = None
    faculty: Optional[MuctrFaculties] = None

    model_config = ConfigDict(use_enum_values=True)
