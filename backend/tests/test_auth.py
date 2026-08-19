from tests.conftest import register_and_login


def test_register_returns_envelope(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "password123"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["message"] == "Account created successfully"
    assert body["data"]["email"] == "alice@example.com"
    assert "password" not in body["data"]
    assert "password_hash" not in body["data"]


def test_register_duplicate_email_returns_409(client):
    payload = {"name": "Alice", "email": "dup@example.com", "password": "password123"}
    client.post("/api/v1/auth/register", json=payload)
    response = client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 409
    body = response.json()
    assert body["success"] is False
    assert body["data"] is None
    assert "already exists" in body["message"]


def test_register_short_password_returns_422(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Alice", "email": "shortpw@example.com", "password": "short"},
    )
    assert response.status_code == 422
    body = response.json()
    assert body["success"] is False
    assert body["data"] is None


def test_login_success_returns_token_envelope(client):
    client.post(
        "/api/v1/auth/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/v1/auth/login", json={"email": "bob@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["access_token"]
    assert body["data"]["token_type"] == "bearer"


def test_login_wrong_password_returns_401(client):
    client.post(
        "/api/v1/auth/register",
        json={"name": "Bob", "email": "bob2@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/v1/auth/login", json={"email": "bob2@example.com", "password": "nope-nope"}
    )
    assert response.status_code == 401
    body = response.json()
    assert body["success"] is False
    assert body["message"] == "Incorrect email or password"


def test_me_without_token_returns_401(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert response.json()["success"] is False


def test_me_with_invalid_token_returns_401(client):
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer garbage"})
    assert response.status_code == 401
    assert response.json()["success"] is False


def test_me_with_valid_token_returns_profile(client):
    headers = register_and_login(client, email="carol@example.com")
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["data"]["email"] == "carol@example.com"


def test_update_profile_duplicate_email_returns_409(client):
    register_and_login(client, email="taken@example.com")
    headers = register_and_login(client, email="mine@example.com")

    response = client.put(
        "/api/v1/auth/me", json={"email": "taken@example.com"}, headers=headers
    )
    assert response.status_code == 409
    assert response.json()["success"] is False


def test_update_profile_success(client):
    headers = register_and_login(client, email="rename@example.com")
    response = client.put("/api/v1/auth/me", json={"name": "New Name"}, headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "Profile updated successfully"
    assert body["data"]["name"] == "New Name"
