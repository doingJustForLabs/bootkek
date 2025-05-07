from typing import Optional

from pydantic import BaseModel, Field

from api.enums import Skills


class PaginationSchema(BaseModel):
    page: int = Field(0, ge=0)
    limit: int = Field(10, le=100, gt=0)


class FiltersSchema(BaseModel):
    # q: Optional[str] = None
    skill: Optional[Skills] = None
