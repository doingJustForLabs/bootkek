from fastapi import FastAPI
from api import get_routers
import uvicorn

app = FastAPI()

app.include_router(get_routers())

if __name__ == '__main__':
    uvicorn.run("src.main:app", reload=True)
