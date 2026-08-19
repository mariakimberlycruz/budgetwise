"""Wraps every successful JSON response from API routes in the same
{"success": true, "message": "...", "data": {...}} envelope used for
errors (see app.core.errors), so the frontend gets one predictable
response shape regardless of outcome.

A route can opt into a specific message (e.g. "Expense created
successfully") by setting `request.state.message` before returning;
otherwise a sensible default is derived from the HTTP method.
"""

import json
from collections.abc import Callable, Coroutine
from typing import Any

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute

_DEFAULT_MESSAGES = {
    "GET": "Retrieved successfully",
    "POST": "Created successfully",
    "PUT": "Updated successfully",
    "PATCH": "Updated successfully",
    "DELETE": "Deleted successfully",
}


class EnvelopeRoute(APIRoute):
    def get_route_handler(self) -> Callable[[Request], Coroutine[Any, Any, Response]]:
        original_route_handler = super().get_route_handler()

        async def envelope_route_handler(request: Request) -> Response:
            response = await original_route_handler(request)
            # FastAPI's response_model "fast path" returns a plain Response
            # (not a JSONResponse instance) with pre-serialized JSON bytes,
            # so check media_type rather than isinstance(..., JSONResponse).
            if (
                not isinstance(response, Response)
                or response.media_type != "application/json"
                or response.status_code >= 400
            ):
                return response

            message = getattr(request.state, "message", None) or _DEFAULT_MESSAGES.get(request.method, "Success")
            data = json.loads(response.body) if response.body else None

            headers = {
                key: value for key, value in response.headers.items() if key.lower() not in ("content-length", "content-type")
            }
            return JSONResponse(
                content={"success": True, "message": message, "data": data},
                status_code=response.status_code,
                headers=headers,
            )

        return envelope_route_handler
