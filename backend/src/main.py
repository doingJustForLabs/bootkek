from fastapi import FastAPI
from api import get_routers
import uvicorn

app = FastAPI()

app.include_router(get_routers(), prefix='/api')


@app.get('/')
def get_root():
    return {'message': 'Api is working!~!!'}


if __name__ == '__main__':
    uvicorn.run("src.main:app", reload=True)
