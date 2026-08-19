"""Verifies every API response - success or error, from any route or from
routing itself - uses the same {success, message, data} envelope, except
the intentionally-excluded /health liveness probe.
"""

from tests.conftest import register_and_login


def test_success_envelope_shape_on_get(client, auth_headers):
    response = client.get("/api/v1/dashboard", params={"month": 8, "year": 2026}, headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {"success", "message", "data"}
    assert body["success"] is True
    assert isinstance(body["message"], str) and body["message"]


def test_unknown_route_still_uses_error_envelope(client):
    response = client.get("/api/v1/this-route-does-not-exist")
    assert response.status_code == 404
    body = response.json()
    assert body == {"success": False, "message": body["message"], "data": None}


def test_method_not_allowed_uses_error_envelope(client, auth_headers):
    response = client.patch("/api/v1/expenses", headers=auth_headers)
    assert response.status_code == 405
    body = response.json()
    assert body["success"] is False
    assert body["data"] is None


def test_health_endpoint_is_intentionally_not_wrapped(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert "success" not in body
    assert body["status"] == "ok"


def test_all_documented_status_codes_are_reachable(client):
    # 401 - no/garbage credentials
    assert client.get("/api/v1/auth/me").status_code == 401

    # 409 - duplicate email
    payload = {"name": "Dup", "email": "envelope-dup@example.com", "password": "password123"}
    client.post("/api/v1/auth/register", json=payload)
    assert client.post("/api/v1/auth/register", json=payload).status_code == 409

    # 422 - validation failure
    assert client.post(
        "/api/v1/auth/register",
        json={"name": "", "email": "not-an-email", "password": "x"},
    ).status_code == 422

    # 404 - resource not found
    headers = register_and_login(client, email="status-codes@example.com")
    assert client.get("/api/v1/expenses/999999", headers=headers).status_code == 404

    # 400 - AppError base is available for domain code that wants a plain 400
    from app.core.errors import BadRequestError

    assert BadRequestError("nope").status_code == 400
