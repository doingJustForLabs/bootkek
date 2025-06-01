from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select

from api.search.schemas import PaginationSchema, FiltersSchema
from api.auth.models import User
from api.profiles.models import Profile
from api.profiles.services import ProfileRepository
from api.chat.schemas import ChatSchema, MessageResponse
from api.chat.models import Message
from api.search.schemas import ChatSearchResult, MessageSearchResult, CombinedChatSearchResponse
from api.search.service import SearchRepository
from database.db import DbSession
from api.dependencies import BearerDependency, AccessDependency

router = APIRouter(tags=["Поиск🔎‍"], prefix="/search")


@router.get("")
async def search_profiles(
    session: DbSession,
    pagination: Annotated[PaginationSchema, Depends()],
    filters: Annotated[FiltersSchema, Depends()],
    keyword: Optional[str] = Query(description="Ищет по имени, юзернейму и скиллам"),
):
    profiles = await SearchRepository.search_profiles(
        session, keyword, pagination, filters
    )
    return profiles

@router.get("/chats", response_model=CombinedChatSearchResponse, dependencies=[BearerDependency])
async def search_chats_and_messages(
    session: DbSession,
    pagination: Annotated[PaginationSchema, Depends()],
    token: AccessDependency,
    keyword: Optional[str] = Query(description="Ищет по названию чата и содержимому сообщений"),
):
    current_profile =await ProfileRepository.get_profile_by_user_id(session, int(token.sub))

    chats, standalone_messages = await SearchRepository.search_chats_and_messages(
        session, current_profile.id, keyword, pagination
    )

    chat_results = []
    for chat in chats:
        # Получаем последние 3 сообщения для каждого чата
        result = await session.execute(
            select(Message)
            .where(Message.chat_id == chat.id)
            .order_by(Message.timestamp.desc())
            .limit(3)
        )
        print(type(result))
        latest_messages = result.scalars().all()
        chat_results.append(
            ChatSearchResult(
                chat=ChatSchema.model_validate(chat, from_attributes=True),
                matching_messages=[MessageResponse.model_validate(msg, from_attributes=True) for msg in latest_messages]
            )
        )

    message_results = [
        MessageSearchResult(
            message=MessageResponse.model_validate(msg, from_attributes=True),
            chat=ChatSchema.model_validate(msg.chat, from_attributes=True) if msg.chat else None
        )
        for msg in standalone_messages
    ]

    return CombinedChatSearchResponse(chats=chat_results, messages=message_results)