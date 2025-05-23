from pydantic import BaseModel


class EnumResponseModel(BaseModel):
    enums: list[str]
    type: str
