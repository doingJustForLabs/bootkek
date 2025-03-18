from fastapi import HTTPException, status


class InvalidTokenException(HTTPException):
    def __init__(self, status_code, detail):
        super().__init__(status_code=status_code, detail=detail)


class InvalidAuthorizationHeaderException(HTTPException):
    def __init__(self, status_code, detail):
        super().__init__(
            status_code=status_code,
            detail=detail,
        )
