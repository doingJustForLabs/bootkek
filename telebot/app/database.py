import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def get_pool():
    return await asyncpg.create_pool(
        dsn=os.getenv("DB_URL"),  # Например: "postgresql+asyncpg://dwh:dwh@127.0.0.1:5435/dwh"
        min_size=1,
        max_size=10
    )



