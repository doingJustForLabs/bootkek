import uvicorn
from fastapi import FastAPI

app = FastAPI()


@app.get('/')
def get_root():
    return {'Message': 'Api is working!'}


if __name__ == '__main__':
    uvicorn.run(app)
