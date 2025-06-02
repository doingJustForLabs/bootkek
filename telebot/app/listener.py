import asyncio

import asyncpg
import json
from aiogram import Bot
from app.database import get_pool


async def pg_listener(bot: Bot):
    pool = await get_pool()
    conn = await pool.acquire()

    async def listen():
        await conn.add_listener(
            "new_follower",
            lambda *args: asyncio.create_task(handle_new_follower(bot, args)),
        )
        print("🔔 Слушаем канал 'new_follower'...")
        try:
            while True:
                await asyncio.sleep(3600)  # Просто держим соединение живым
        finally:
            await conn.remove_listener("new_follower", handle_new_follower)
            await pool.release(conn)

    asyncio.create_task(listen())


async def handle_new_follower(bot: Bot, args):
    _, _, _, payload_str = args
    payload = json.loads(payload_str)

    follower_id = payload.get("follower_id")
    target_id = payload.get("target_id")

    pool = await get_pool()
    async with pool.acquire() as conn:
        # Получаем tg_id того, на кого подписались
        target = await conn.fetchrow(
            "SELECT tg_id FROM profiles WHERE user_id = $1", target_id
        )
        print("target:", target)
        # Получаем имя подписчика
        follower = await conn.fetchrow(
            "SELECT name FROM profiles WHERE user_id = $1", follower_id
        )
        print("follower:", follower)

    if target and target["tg_id"] and follower:
        print("делаем делаем:")
        await bot.send_message(
            target["tg_id"],
            f"📩 Пользователь с именем {follower['name']} подписался на вас!",
        )
    else:
        print("залибобка)")
