from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.exceptions import InvalidToken

from .base import BaseAppException


def custom_exception_handler(exc, context):

    if isinstance(exc, BaseAppException):
        return Response(
            {
                "success": False,
                "message": exc.message,
                "errors": exc.errors,
            },
            status=exc.status_code,
        )

    if isinstance(exc, InvalidToken):
        return Response(
            {
                "success": False,
                "message": "Token expired. Please login again.",
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return exception_handler(exc, context)