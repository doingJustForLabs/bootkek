from typing import Optional

from pydantic import BaseModel, Field, ConfigDict, model_validator

from api.enums import Sex, MuctrFaculties
from api.exceptions import BadRequestException
from api.profiles.schemas import ProfileReadSummarySchema
from api.chat.schemas import MessageResponse, ChatSchema


class PaginationSchema(BaseModel):
    page: int = Field(1, gt=0)
    limit: int = Field(5, le=100, gt=0)


class FiltersSchema(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    course: Optional[int] = Field(None, ge=1, le=4)
    sex: Optional[Sex] = None
    faculty: Optional[MuctrFaculties] = None


class SearchResponseSchema(BaseModel):
    profiles: list[ProfileReadSummarySchema]
    pagination: PaginationSchema
    total_profiles: int
    total_pages: int

    # @model_validator(mode="after")
    # def validate_page(self):
    #     if not 1 <= self.pagination.page <= self.total_pages:
    #         raise BadRequestException("Такой страницы не существует")
    #     return self


class ChatSearchResult(BaseModel):
    chat: ChatSchema
    matching_messages: list[MessageResponse]


class MessageSearchResult(BaseModel):
    message: MessageResponse
    chat: Optional[ChatSchema]


class CombinedChatSearchResponse(BaseModel):
    chats: list[ChatSearchResult]
    messages: list[MessageSearchResult]
