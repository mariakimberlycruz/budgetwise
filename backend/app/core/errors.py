"""Domain error hierarchy and global exception handlers.

Every error response the API returns — validation failures, auth/authz
failures, missing/duplicate resources, database failures, and anything
unexpected — is funneled through here into the same
{"success": false, "message": "...", "data": null} envelope, with the
right HTTP status code. Route handlers raise a typed AppError subclass
(or a plain HTTPException) instead of building this shape by hand.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("budgetwise")


class AppError(Exception):
    """Base class for domain errors that map directly to an HTTP status."""

    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class BadRequestError(AppError):
    status_code = status.HTTP_400_BAD_REQUEST


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED


class ForbiddenError(AppError):
    status_code = status.HTTP_403_FORBIDDEN


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT


def error_response(status_code: int, message: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"success": False, "message": message, "data": None})


def _first_validation_message(exc: RequestValidationError) -> str:
    errors = exc.errors()
    if not errors:
        return "The request could not be validated."
    first = errors[0]
    message = first.get("msg", "Invalid value.")
    # Pydantic v2 prefixes messages raised from a custom validator with
    # "Value error, " — strip that so users see a clean sentence.
    prefix = "Value error, "
    if message.startswith(prefix):
        message = message[len(prefix) :]
    field = ".".join(str(part) for part in first.get("loc", []) if part not in ("body", "query", "path"))
    return f"{field}: {message}" if field else message


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        return error_response(exc.status_code, exc.message)

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        message = exc.detail if isinstance(exc.detail, str) else "The request could not be completed."
        response = error_response(exc.status_code, message)
        if exc.headers:
            response.headers.update(exc.headers)
        return response

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        return error_response(status.HTTP_422_UNPROCESSABLE_CONTENT, _first_validation_message(exc))

    @app.exception_handler(SQLAlchemyError)
    async def handle_database_error(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        logger.exception("Database error handling %s %s", request.method, request.url.path)
        return error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "A database error occurred. Please try again.",
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error handling %s %s", request.method, request.url.path)
        return error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "An unexpected error occurred. Please try again.",
        )
