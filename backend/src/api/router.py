from fastapi import APIRouter

router = APIRouter(
    tags=['Root']
)


@router.get('/')
def get_root():
    return {'message': 'lessgo'}
