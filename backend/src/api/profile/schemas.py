from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class Sex(str, Enum):
    male = "mail"
    female = "femail"


class ProfileSetupSchema(BaseModel):
    username: str = Field(..., max_length=30)
    name: str = Field(..., max_length=30)
    is_required_completed: bool = False


class ProfileSchema(ProfileSetupSchema):
    surname: Optional[str] = None

    # sex: Optional[Sex] = None
    # birthdate: Optional[date] = None
    # city: Optional[str] = None
    # status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)
