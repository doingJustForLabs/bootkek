from aiogram import Router, F
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from app.http_client import api_client  # путь к твоему ApiClient
from app.db_requests import (
    update_tg_id,
    get_user_id_by_email,
)  # функция записи tg_id в БД

router = Router()


class AuthState(StatesGroup):
    waiting_email = State()
    waiting_password = State()


@router.message(F.text == "/start")
async def start(message: Message):
    await message.answer(
        "Привет, я Granite-Bot, официальный Телеграм-Бот сервиса по поиску напарников в учебе Granite!"
    )


@router.message(F.text == "/help")
async def help(message: Message):
    await message.answer(
        """
    Тебе нужно авторизоваться, чтобы получить доступ к моим функциям!
    Для авторизации нажми /login
    Если нет аккаунта в Granite, то самое время его создать - нажми /link
                         """
    )


@router.message(F.text == "/link")
async def link(message: Message):
    await message.answer("https://www.youtube.com/watch?v=dQw4w9WgXcQ")


@router.message(F.text == "/rickroll")
async def link(message: Message):
    await message.answer("https://www.youtube.com/watch?v=dQw4w9WgXcQ")


@router.message(F.text == "/login")
async def start_login(message: Message, state: FSMContext):
    await message.answer("Введите ваш email:")
    await state.set_state(AuthState.waiting_email)


@router.message(AuthState.waiting_email)
async def get_email(message: Message, state: FSMContext):
    await state.update_data(email=message.text)
    await message.answer("Теперь введите ваш пароль:")
    await state.set_state(AuthState.waiting_password)


@router.message(AuthState.waiting_password)
async def get_password(message: Message, state: FSMContext):
    await state.update_data(password=message.text)
    data = await state.get_data()

    res = await api_client.login(data["email"], data["password"])
    print(res)

    if res.get("access_token"):
        # Получаем user_id по email из таблицы users
        user_id = await get_user_id_by_email(data["email"])

        if user_id is None:
            await message.answer("Не удалось найти пользователя по email.")
        else:
            # Обновляем tg_id в таблице profiles
            await update_tg_id(user_id, message.from_user.id)
            await message.answer("Вы успешно вошли!")

    else:
        await message.answer("Ошибка авторизации. Проверьте email и пароль.")

    await api_client.close_session()
    await state.clear()
