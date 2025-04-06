from typing import Annotated

from authx import TokenPayload
from fastapi import Request, HTTPException, status, Depends

from api.auth.models import User
from api.auth.services import UserService, get_user_service
from core.security import security


async def verify_access_token(request: Request) -> str:
    try:
        token = await security.get_access_token_from_request(
            request,
            locations=["headers"],
        )

        payload = security.verify_token(token)

        return payload

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


TokenDependency = Annotated[TokenPayload, Depends(verify_access_token)]


async def get_current_user(
    token: TokenDependency,
    user_service: Annotated[UserService, Depends(get_user_service)],
) -> User:
    user = await user_service.get_user_by_user_id(int(token.sub))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


# TODO Сделать супер юзера


async def get_current_superuser(cur_user: CurrentUser) -> User:
    if not cur_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )

    return cur_user


CurrentSuperUser = Annotated[User, Depends(get_current_superuser)]
