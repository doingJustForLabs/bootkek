from fastapi import APIRouter

from core.models.requests import set_user, get_users
from core.schemas.users import UserCreate

router = APIRouter(
    prefix='/users',
    tags=['Users']
)


@router.post('')
async def post_user(user: UserCreate):
    await set_user(user.name, user.email, user.password)

    return {'message': 'ok'}


@router.get('')
async def get_all_users():
    resp = await get_users()
    return resp
