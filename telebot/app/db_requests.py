from app.database import get_pool

_pool = None

async def init_db_pool():
    global _pool
    if _pool is None:
        _pool = await get_pool()

async def run_sql_script(path: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        with open(path, "r") as f:
            await conn.execute(f.read())

async def update_tg_id(user_id: int, tg_id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE profiles SET tg_id = $1 WHERE user_id = $2",
            tg_id, user_id
        )
async def get_user_id_by_email(email: str) -> int | None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT id FROM users WHERE email = $1", email)
        return row["id"] if row else None


