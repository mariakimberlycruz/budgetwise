from tests.conftest import register_and_login


def _create_income(client, headers, amount="1000.00", income_type="Salary", income_date="2026-08-01"):
    return client.post(
        "/api/v1/income",
        json={"amount": amount, "income_type": income_type, "income_date": income_date},
        headers=headers,
    )


def test_create_income_success(client, auth_headers):
    response = _create_income(client, auth_headers)
    assert response.status_code == 201
    body = response.json()
    assert body["message"] == "Income added successfully"
    assert body["data"]["amount"] == "1000.00"


def test_income_cannot_be_negative(client, auth_headers):
    response = _create_income(client, auth_headers, amount="-1")
    assert response.status_code == 422
    assert response.json()["success"] is False


def test_income_cannot_be_zero(client, auth_headers):
    response = _create_income(client, auth_headers, amount="0")
    assert response.status_code == 422


def test_income_list_scoped_to_current_user(client, auth_headers, other_auth_headers):
    _create_income(client, auth_headers)
    _create_income(client, other_auth_headers, amount="500.00")

    response = client.get("/api/v1/income", headers=auth_headers)
    items = response.json()["data"]["items"]
    assert len(items) == 1
    assert items[0]["amount"] == "1000.00"


def test_user_cannot_read_another_users_income(client, auth_headers, other_auth_headers):
    created = _create_income(client, auth_headers).json()["data"]

    response = client.get(f"/api/v1/income/{created['id']}", headers=other_auth_headers)
    assert response.status_code == 404


def test_user_cannot_update_another_users_income(client, auth_headers, other_auth_headers):
    created = _create_income(client, auth_headers).json()["data"]

    response = client.put(
        f"/api/v1/income/{created['id']}",
        json={"amount": "1.00"},
        headers=other_auth_headers,
    )
    assert response.status_code == 404


def test_user_cannot_delete_another_users_income(client, auth_headers, other_auth_headers):
    created = _create_income(client, auth_headers).json()["data"]

    response = client.delete(f"/api/v1/income/{created['id']}", headers=other_auth_headers)
    assert response.status_code == 404

    # still visible to the owner afterwards
    still_there = client.get(f"/api/v1/income/{created['id']}", headers=auth_headers)
    assert still_there.status_code == 200


def test_delete_income_success(client, auth_headers):
    created = _create_income(client, auth_headers).json()["data"]

    response = client.delete(f"/api/v1/income/{created['id']}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Income deleted successfully"

    gone = client.get(f"/api/v1/income/{created['id']}", headers=auth_headers)
    assert gone.status_code == 404
