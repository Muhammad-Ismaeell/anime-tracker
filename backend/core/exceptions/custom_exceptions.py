from .base import BaseAppException


class ValidationException(BaseAppException):

    def __init__(self, message):
        super().__init__(
            message,
            status_code=400
        )


class NotFoundException(BaseAppException):

    def __init__(self, message="Not found"):
        super().__init__(
            message,
            status_code=404
        )


class UnauthorizedException(BaseAppException):

    def __init__(self, message="Unauthorized"):
        super().__init__(
            message,
            status_code=401
        )