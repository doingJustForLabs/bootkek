from typing import List, Annotated

from fastapi import APIRouter, Depends, status

from api.followers.services import FollowerRepository
from api.profiles.schemas import ProfileSummaryDataSchema, PaginationSchema
from database.db import DbSession
from api.auth.views import AccessDependency, http_bearer

router = APIRouter(tags=["Фолловеры🫂"])


@router.get(
    "/profiles/{user_id}/followers", response_model=List[ProfileSummaryDataSchema]
)
async def get_user_followers(
    session: DbSession,
    user_id: int,
    pagination: Annotated[PaginationSchema, Depends(PaginationSchema)],
):
    followers = await FollowerRepository.get_user_followers(session, user_id)
    return followers


@router.get(
    "/profiles/{user_id}/following", response_model=List[ProfileSummaryDataSchema]
)
async def get_user_follows(
    session: DbSession,
    user_id: int,
    pagination: Annotated[PaginationSchema, Depends(PaginationSchema)],
):
    follows = await FollowerRepository.get_user_follows(session, user_id)
    return follows


@router.post("/profiles/{target_id}", dependencies=[Depends(http_bearer)])
async def follow_user(
    session: DbSession,
    token: AccessDependency,
    target_id: int,
):
    follower = await FollowerRepository.subscribe(
        session, follower_id=int(token.sub), target_id=target_id
    )
    return {"follower": follower}


@router.delete(
    "/profiles/{target_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(http_bearer)],
)
async def unfollow_user(
    session: DbSession,
    token: AccessDependency,
    target_id: int,
):
    await FollowerRepository.unsubscribe(
        session, follower_id=int(token.sub), target_id=target_id
    )
    return
