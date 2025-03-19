from typing import Annotated
from fastapi import Cookie, WebSocket, WebSocketException, status, Query, Header

from authx import TokenPayload

from src.core.security import security

# async def get_cookie_or_token(
#         websocket: WebSocket,
#         session: Annotated[str | None, Cookie()] = None,
#         token: Annotated[str | None, Query()] = None,
# ):
#     if session is None and token is None:
#         raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
#     return session or token

async def get_user_id_from_token(
        websocket: WebSocket,
        token: Annotated[str | None, Header()] = None
):
    if not token:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    payload = security.decode_access_token(token)
    if not payload:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    return payload.sub      # ID пользователя