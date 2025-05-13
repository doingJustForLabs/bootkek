from pydantic import BaseModel
from typing import List


class CreateChatRequest(BaseModel):
    name: str
    user_ids: List[int]
