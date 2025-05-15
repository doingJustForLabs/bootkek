from typing import Annotated

from authx import TokenPayload
from fastapi import Depends
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio.session import AsyncSession

from database.db import db_helper
from utils import verify_access_token, verify_refresh_token

# JWT Dependencies
AccessDependency = Annotated[TokenPayload, Depends(verify_access_token)]
RefreshDependency = Annotated[TokenPayload, Depends(verify_refresh_token)]

http_bearer = HTTPBearer(auto_error=False)
BearerDependency = Depends(http_bearer)

# DB Dependencies
DbSession = Annotated[AsyncSession, Depends(db_helper.session_getter)]
