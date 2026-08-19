def test_default_settings_are_50_30_20_php(client, auth_headers):
    response = client.get("/api/v1/settings", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["currency"] == "PHP"
    assert data["budget_needs"] == 50
    assert data["budget_savings"] == 30
    assert data["budget_wants"] == 20
    assert data["theme"] == "system"


def test_standard_50_30_20_split_is_valid(client, auth_headers):
    response = client.put(
        "/api/v1/settings",
        json={
            "currency": "PHP",
            "budget_needs": 50,
            "budget_savings": 30,
            "budget_wants": 20,
            "theme": "dark",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Settings saved successfully"


def test_custom_percentages_that_total_100_are_valid(client, auth_headers):
    response = client.put(
        "/api/v1/settings",
        json={
            "currency": "USD",
            "budget_needs": 40,
            "budget_savings": 40,
            "budget_wants": 20,
            "theme": "light",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["budget_needs"] == 40
    assert data["budget_savings"] == 40
    assert data["budget_wants"] == 20


def test_percentages_not_totaling_100_are_rejected(client, auth_headers):
    response = client.put(
        "/api/v1/settings",
        json={
            "currency": "PHP",
            "budget_needs": 50,
            "budget_savings": 30,
            "budget_wants": 30,
            "theme": "system",
        },
        headers=auth_headers,
    )
    assert response.status_code == 422
    body = response.json()
    assert body["success"] is False
    assert "100" in body["message"]


def test_invalid_theme_rejected(client, auth_headers):
    response = client.put(
        "/api/v1/settings",
        json={
            "currency": "PHP",
            "budget_needs": 50,
            "budget_savings": 30,
            "budget_wants": 20,
            "theme": "rainbow",
        },
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_settings_require_authentication(client):
    response = client.get("/api/v1/settings")
    assert response.status_code == 401
