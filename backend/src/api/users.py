from fastapi import APIRouter, HTTPException, status

from database.crud import set_user, get_users, get_user_by_user_id
from database.schemas.users import UserCreate

router = APIRouter(prefix="/users", tags=["CRUD"])


@router.post("")
async def post_user(user: UserCreate):
    await set_user(user.email, user.password)

    return {"message": "ok"}


@router.get("")
async def get_all_users():
    resp = await get_users()
    return resp


@router.get("/{user_id}")
async def get_user_by_id(user_id: int):
    resp = await get_user_by_user_id(user_id)

    if not resp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Такого пользователя нет")

    return resp
