import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()


async def get_pool():
    return await asyncpg.create_pool(dsn=os.getenv("DB__URL"), min_size=1, max_size=10)
