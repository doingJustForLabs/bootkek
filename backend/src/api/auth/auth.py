from authx import TokenPayload
from fastapi import APIRouter, HTTPException, status, Depends, Response

from api.auth.security import security
from core.config import settings
from core.schemas.auth import UserLoginSchema, UserRegisterSchema

router = APIRouter(
    tags=['Auth'],
    prefix='/auth'
)


@router.post('/register')
def register_user(creds: UserRegisterSchema):
    ...


@router.post('/login')
def login_user(creds: UserLoginSchema, response: Response):
    if creds.username == 'admin' and creds.password == 'admin':
        access_token = security.create_access_token(uid=creds.username)
        refresh_token = security.create_refresh_token(uid=creds.username)

        response.set_cookie(settings.jwt.access_cookie_name, access_token, httponly=True, secure=True)
        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Bad credentials')


@router.get('/refresh')
def refresh_access_token():
    new_access_token = security.create_access_token()
    return {'new_access_token': new_access_token}


@router.get('/protected')
def get_protected(payload: TokenPayload = Depends(security.access_token_required)):
    return {'message': f'Hola Hola, {payload.sub}'}


@router.post('/logout')
def logout_user(payload: TokenPayload = Depends(security.access_token_required)):
    security.unset_refresh_cookies()
    return {'message': f'Bye, bye, {payload.sub}..'}
