from math import ceil

from fastapi import APIRouter, Request
from fastapi_cache.decorator import cache

from api.dependencies import (
    AccessDependency,
    BearerDependency,
    PaginationDependency,
    DbSession,
)
from api.followers.schemas import FollowsResponseSchema
from api.followers.services import FollowerRepository
from api.profiles.schemas import ProfileReadSummarySchema
from api.profiles.services import ProfileRepository
from api.search.schemas import SearchResponseSchema
from limiter import limiter

router = APIRouter(prefix="/follows", tags=["Фолловеры🫂"])


@cache(expire=300)
@router.get("/{user_id}/followers", response_model=SearchResponseSchema)
async def get_user_followers(
    session: DbSession,
    user_id: int,
    pagination: PaginationDependency,
):
    """Получение подписчиков пользователя"""
    await ProfileRepository.get_profile_by_user_id(
        session, user_id, not_found_error=True
    )

    followers = await FollowerRepository.get_user_followers(
        session, user_id, pagination
    )

    count = await FollowerRepository.get_count_user_followers(session, user_id)

    return SearchResponseSchema(
        profiles=[
            ProfileReadSummarySchema.model_validate(follower) for follower in followers
        ],
        pagination=pagination,
        total_pages=ceil(count / pagination.limit),
        total_profiles=count,
    )


@cache(expire=300)
@router.get("/{user_id}/followings", response_model=SearchResponseSchema)
async def get_user_follows(
    session: DbSession,
    user_id: int,
    pagination: PaginationDependency,
):
    """Получение подписок пользователя"""
    await ProfileRepository.get_profile_by_user_id(
        session, user_id, not_found_error=True
    )

    follows = await FollowerRepository.get_user_follows(session, user_id, pagination)
    count = await FollowerRepository.get_count_user_follows(session, user_id)

    return SearchResponseSchema(
        profiles=[
            ProfileReadSummarySchema.model_validate(follow) for follow in follows
        ],
        pagination=pagination,
        total_pages=ceil(count / pagination.limit),
        total_profiles=count,
    )


@router.post(
    "/{target_id}",
    dependencies=[BearerDependency],
    response_model=FollowsResponseSchema,
)
@limiter.limit("3/minute")
async def follow_user(
    session: DbSession, token: AccessDependency, target_id: int, request: Request
):
    """Подписка на пользователя"""
    await ProfileRepository.get_profile_by_user_id(
        session, target_id, not_found_error=True
    )

    await FollowerRepository.subscribe(
        session, follower_id=int(token.sub), target_id=target_id
    )
    target_user = await ProfileRepository.get_profile_by_user_id(session, target_id)

    return FollowsResponseSchema(detail=f"Вы подписались на {target_user.username}")


@router.delete(
    "/{target_id}",
    dependencies=[BearerDependency],
    response_model=FollowsResponseSchema,
)
@limiter.limit("3/minute")
async def unfollow_user(
    session: DbSession, token: AccessDependency, target_id: int, request: Request
):
    """Отписка от пользователя"""
    await ProfileRepository.get_profile_by_user_id(
        session, target_id, not_found_error=True
    )

    await FollowerRepository.unsubscribe(
        session, follower_id=int(token.sub), target_id=target_id
    )
    target_user = await ProfileRepository.get_profile_by_user_id(session, target_id)

    return FollowsResponseSchema(detail=f"Вы отписались от {target_user.username}")
