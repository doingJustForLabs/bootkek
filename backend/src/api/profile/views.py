from typing import Annotated

from authx import TokenPayload
from fastapi import APIRouter, Depends

from api.auth.services import UserAuthRepository
from api.auth.views import http_bearer
from database.db import DbSession
from utils import verify_access_token

router = APIRouter(
    tags=["Профиль👨‍💻"],
    prefix='/profile',
    dependencies=[Depends(http_bearer)]
)


@router.get('')
def get_profile(
        token: Annotated[TokenPayload, Depends(verify_access_token)]
):
    return token.sub


@router.get('/{user_id}')
async def get_profile_user(
        token: Annotated[TokenPayload, Depends(verify_access_token)],
        # user_id: int,
        session: DbSession
):
    return await UserAuthRepository.get_user_by_user_id(session, int(token.sub))
