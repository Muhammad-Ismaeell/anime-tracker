import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler
from rest_framework_simplejwt.exceptions import InvalidToken

from .base import BaseAppException

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    logger.exception("API EXCEPTION: %s", exc)

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
                "message": "Invalid or expired token. Please login again.",
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return exception_handler(exc, context)
