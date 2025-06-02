import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def get_pool():
    return await asyncpg.create_pool(
        user=os.getenv("USER"),
        password=os.getenv("PASSWORD"),
        database=os.getenv("DB_NAME"),
        host=os.getenv("HOST"),
        port=os.getenv("PORT"),
        min_size=1,
        max_size=10,
    )



