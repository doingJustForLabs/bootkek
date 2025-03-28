from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError
from authx.exceptions import InvalidToken
from starlette import status

from api.auth.services import UserAuthRepository
from core.security import security
from database.db import DbSession
from database.models import User

oauth = OAuth2PasswordBearer(
    tokenUrl='/api/auth/login'
)

TokenDep = Annotated[str, Depends(oauth)]


async def get_current_user(session: DbSession, token: TokenDep):
    try:
        payload = security.verify_token(token)

    except (ValidationError, InvalidToken):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    user = UserAuthRepository.get_user_by_user_id(session, int(payload.sub))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
