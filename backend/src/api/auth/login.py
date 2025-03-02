from authx import TokenPayload
from fastapi import APIRouter, HTTPException, status, Depends, Response
from pydantic import BaseModel

from api.auth.security import security
from core.config import settings

router = APIRouter(
    tags=['JWT-Auth'],
    prefix='/auth'
)


class UserLoginSchema(BaseModel):
    username: str
    password: str


@router.post('/login')
def login(creds: UserLoginSchema, response: Response):
    if creds.username == 'admin' and creds.password == 'admin':
        token = security.create_access_token(uid=creds.username)
        response.set_cookie(settings.jwt.access_cookie_name, token)
        return {'access token': token}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Bad credentials')


@router.get('/protected')
def get_protected(payload: TokenPayload = Depends(security.access_token_required)):
    return {'message': f'Hola Hola, {payload.sub}'}
