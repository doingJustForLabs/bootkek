from authx import TokenPayload
from fastapi import APIRouter, Depends, Response, HTTPException
from starlette import status

from core.config import settings
from core.security import security
from database.db import db_helper
from database.repositories.auth import UserAuthRepository
from database.schemas.auth import UserLoginSchema, UserRegisterSchema
from utils import hash_password, verify_password

router = APIRouter(
    tags=['Authorization👤'],
    prefix='/auth'
)


@router.post('/register')
async def register_user(creds: UserRegisterSchema, session=Depends(db_helper.session_getter)):
    if await UserAuthRepository.get_user_by_email(session, creds.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email уже используется')

    await UserAuthRepository.set_user(session, email=creds.email, password=hash_password(creds.password))
    return {'detail': 'user registered'}


@router.post('/login')
async def login_user(creds: UserLoginSchema, response: Response, session=Depends(db_helper.session_getter)):
    user = await UserAuthRepository.get_user_by_email(session, creds.email)

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Такая почта не зарегистрирована')

    if not verify_password(creds.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Неправильный пароль')

    access_token = security.create_access_token(uid=str(user.id))
    refresh_token = security.create_refresh_token(uid=str(user.id))

    response.set_cookie(settings.jwt.access_cookie_name, access_token, httponly=True, secure=True)

    return {
        'detail': 'success login!',
        'access_token': access_token,
        'refresh_token': refresh_token,
    }


@router.get('/protected')
def get_protected(payload: TokenPayload = Depends(security.access_token_required)):
    try:
        return {'message': f'Hola Hola, numero {payload.sub}'}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={'message': e})

# @router.get('/refresh')
# def refresh_access_token():
#     new_access_token = security.create_access_token()
#     return {'new_access_token': new_access_token}


# @router.post('/logout')
# def logout_user(payload: TokenPayload = Depends(security.access_token_required)):
#     security.unset_refresh_cookies()
#     return {'message': f'Bye, bye, {payload.sub}..'}
