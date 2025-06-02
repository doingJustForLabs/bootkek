import asyncio
import logging
import os
from aiogram import Bot, Dispatcher
from dotenv import load_dotenv
from app.handlers import router
from app.db_requests import init_db_pool, run_sql_script
from app.http_client import api_client
from app.listener import pg_listener

load_dotenv()

bot = Bot(token=os.getenv("TOKEN_API"))
dp = Dispatcher()


async def on_startup(dispatcher: Dispatcher):
    print("Бот запускается...")
    logging.info("Запускает бота")
    await api_client.create_session()


async def on_shutdown(dispatcher: Dispatcher):
    print("Бот останавливается...")
    logging.info("Останавливаем бота")
    await api_client.close_session()


async def init():
    await run_sql_script("scripts/notify_trigger.sql")


async def main():
    logging.basicConfig(level=logging.INFO)
    await init_db_pool()
    await init()

    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)
    dp.include_router(router)

    # НЕ await — запускаем в фоне!
    asyncio.create_task(pg_listener(bot))

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
