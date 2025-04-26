from fastapi import status, FastAPI, Request
from fastapi.responses import ORJSONResponse


class AppException(Exception):
    def __init__(self, message):
        self.message = message


class NotFoundException(AppException):
    def __init__(self, message: str = "Not found"):
        super().__init__(message)


class BadRequestException(AppException):
    def __init__(self, message: str = "Bad request"):
        super().__init__(message)


class TooEarlyException(AppException):
    def __init__(self, message: str = "Too early request"):
        super().__init__(message)


def init_exception_handlers(app: FastAPI):

    @app.exception_handler(NotFoundException)
    def handle_not_found_error(request: Request, exc: NotFoundException):
        return ORJSONResponse(
            status_code=status.HTTP_404_NOT_FOUND, content={"detail": exc.message}
        )

    @app.exception_handler(BadRequestException)
    def handle_not_found_error(request: Request, exc: BadRequestException):
        return ORJSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST, content={"detail": exc.message}
        )

    @app.exception_handler(TooEarlyException)
    def handle_not_found_error(request: Request, exc: TooEarlyException):
        return ORJSONResponse(
            status_code=status.HTTP_425_TOO_EARLY, content={"detail": exc.message}
        )
