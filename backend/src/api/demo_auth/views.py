import secrets
from typing import Annotated

from fastapi import APIRouter, HTTPException, status
from fastapi.params import Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials

router = APIRouter(
    prefix='/demo-auth',
    tags=['Demo-Auth']
)

security = HTTPBasic()

users: dict[str, str] = {
    'admin': 'admin',
}


@router.get('/basic-auth/login', description='Аутентификация пользователя')
def demo_basic_auth_login(
        credentials: Annotated[HTTPBasicCredentials, Depends(security)]
):
    users[credentials.username] = credentials.password
    return {
        'message': 'Буу, вот все твои данные, лох',
        'username': credentials.username,
        'password': credentials.password
    }

def check_username_auth(
        credentials: Annotated[HTTPBasicCredentials, Depends(security)],
):
    unauthorized_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Пользователь на авторизован',
        headers={'WWW-Authenticate': 'Basic'}
    )

    cur_password = users.get(credentials.username)

    if cur_password is None:
        raise unauthorized_exception

    if not secrets.compare_digest(
            credentials.password.encode('utf-8'),
            cur_password.encode('utf-8')
    ):
        raise unauthorized_exception

    return credentials.username


@router.get('/basic-auth-check-user', description='Проверка на наличие пользователя в "БД"')
def demo_basic_auth_check_user(
        auth_username: str = Depends(check_username_auth)
):
    return {'message': f'Hi {auth_username}'}


@router.get('/basic-auth/logout')
def demo_basic_auth_logout(
        auth_username: str = Depends(check_username_auth)
):
    users.pop(auth_username)
    return {'message': f'Bye, {auth_username}'}
