import uvicorn
from fastapi import FastAPI

app = FastAPI()


@app.get('/')
def get_root():
    return "БАРАБУЛЬКА"


if __name__ == '__main__':
    uvicorn.run(app)
