from pydantic import BaseModel, ConfigDict, Field


class ProfileSchema(BaseModel):
    name: str
    username: str = Field(..., min_length=5)

    model_config = ConfigDict(extra="forbid")
