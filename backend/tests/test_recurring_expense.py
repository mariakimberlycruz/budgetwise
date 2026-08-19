def _create_bill(
    client,
    headers,
    name="Rent",
    amount="1500.00",
    category="Needs",
    frequency="monthly",
    due_day=1,
    start_date="2026-01-01",
):
    return client.post(
        "/api/v1/recurring-expenses",
        json={
            "name": name,
            "amount": amount,
            "category": category,
            "frequency": frequency,
            "due_day": due_day,
            "start_date": start_date,
        },
        headers=headers,
    )


def test_create_bill_success(client, auth_headers):
    response = _create_bill(client, auth_headers)
    assert response.status_code == 201
    assert response.json()["message"] == "Bill added successfully"


def test_bill_amount_must_be_positive(client, auth_headers):
    response = _create_bill(client, auth_headers, amount="0")
    assert response.status_code == 422


def test_weekly_due_day_must_be_1_to_7(client, auth_headers):
    response = _create_bill(client, auth_headers, frequency="weekly", due_day=10)
    assert response.status_code == 422


def test_invalid_frequency_rejected(client, auth_headers):
    response = _create_bill(client, auth_headers, frequency="daily")
    assert response.status_code == 422


def test_toggle_active_via_update(client, auth_headers):
    created = _create_bill(client, auth_headers).json()["data"]
    response = client.put(
        f"/api/v1/recurring-expenses/{created['id']}",
        json={
            "name": created["name"],
            "amount": created["amount"],
            "category": created["category"],
            "frequency": created["frequency"],
            "due_day": created["due_day"],
            "start_date": created["start_date"],
            "active": False,
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["data"]["active"] is False


def test_user_cannot_access_another_users_bill(client, auth_headers, other_auth_headers):
    created = _create_bill(client, auth_headers).json()["data"]

    assert client.get(f"/api/v1/recurring-expenses/{created['id']}", headers=other_auth_headers).status_code == 404
    assert client.delete(f"/api/v1/recurring-expenses/{created['id']}", headers=other_auth_headers).status_code == 404


def test_bills_scoped_to_current_user(client, auth_headers, other_auth_headers):
    _create_bill(client, auth_headers)
    _create_bill(client, other_auth_headers, name="Internet")

    response = client.get("/api/v1/recurring-expenses", headers=auth_headers)
    items = response.json()["data"]["items"]
    assert len(items) == 1
    assert items[0]["name"] == "Rent"
