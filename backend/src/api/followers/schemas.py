from pydantic import BaseModel


class FollowsResponseSchema(BaseModel):
    detail: str
