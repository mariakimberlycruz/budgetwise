def _create_goal(client, headers, target="1000.00", current="0", name="Emergency Fund", target_date="2026-12-31"):
    return client.post(
        "/api/v1/savings-goals",
        json={"name": name, "target_amount": target, "current_amount": current, "target_date": target_date},
        headers=headers,
    )


def test_create_goal_success(client, auth_headers):
    response = _create_goal(client, auth_headers)
    assert response.status_code == 201
    assert response.json()["message"] == "Savings goal created successfully"


def test_target_amount_must_be_positive(client, auth_headers):
    response = _create_goal(client, auth_headers, target="0")
    assert response.status_code == 422


def test_current_amount_cannot_be_negative(client, auth_headers):
    response = _create_goal(client, auth_headers, current="-5")
    assert response.status_code == 422


def test_progress_percent_is_calculated_correctly(client, auth_headers):
    created = _create_goal(client, auth_headers, target="1000.00", current="250.00").json()["data"]
    assert created["progress_percent"] == 25
    assert created["remaining"] == "750.00"


def test_progress_percent_caps_at_100(client, auth_headers):
    created = _create_goal(client, auth_headers, target="100.00", current="0").json()["data"]

    response = client.post(
        f"/api/v1/savings-goals/{created['id']}/contributions",
        json={"amount": "500.00"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["progress_percent"] == 100
    assert data["current_amount"] == "500.00"
    assert data["remaining"] == "0.00"


def test_contribution_updates_current_amount(client, auth_headers):
    created = _create_goal(client, auth_headers, target="1000.00", current="100.00").json()["data"]

    response = client.post(
        f"/api/v1/savings-goals/{created['id']}/contributions",
        json={"amount": "50.00"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "Contribution added successfully"
    assert body["data"]["current_amount"] == "150.00"


def test_contribution_amount_must_be_positive(client, auth_headers):
    created = _create_goal(client, auth_headers).json()["data"]
    response = client.post(
        f"/api/v1/savings-goals/{created['id']}/contributions",
        json={"amount": "0"},
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_user_cannot_access_another_users_goal(client, auth_headers, other_auth_headers):
    created = _create_goal(client, auth_headers).json()["data"]

    read = client.get(f"/api/v1/savings-goals/{created['id']}", headers=other_auth_headers)
    assert read.status_code == 404

    contribute = client.post(
        f"/api/v1/savings-goals/{created['id']}/contributions",
        json={"amount": "10.00"},
        headers=other_auth_headers,
    )
    assert contribute.status_code == 404

    delete = client.delete(f"/api/v1/savings-goals/{created['id']}", headers=other_auth_headers)
    assert delete.status_code == 404


def test_delete_goal_success(client, auth_headers):
    created = _create_goal(client, auth_headers).json()["data"]
    response = client.delete(f"/api/v1/savings-goals/{created['id']}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Savings goal deleted successfully"
