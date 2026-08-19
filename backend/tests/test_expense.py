def _create_expense(client, headers, amount="50.00", category="Needs", subcategory="Food", date="2026-08-01"):
    return client.post(
        "/api/v1/expenses",
        json={
            "amount": amount,
            "category": category,
            "subcategory": subcategory,
            "expense_date": date,
        },
        headers=headers,
    )


def test_create_expense_success_matches_spec_envelope(client, auth_headers):
    response = _create_expense(client, auth_headers)
    assert response.status_code == 201
    body = response.json()
    assert body == {
        "success": True,
        "message": "Expense created successfully",
        "data": body["data"],
    }
    assert body["data"]["amount"] == "50.00"
    assert body["data"]["category"] == "Needs"


def test_expense_cannot_be_negative(client, auth_headers):
    response = _create_expense(client, auth_headers, amount="-10")
    assert response.status_code == 422
    body = response.json()
    assert body["success"] is False
    assert body["data"] is None


def test_expense_cannot_be_zero(client, auth_headers):
    response = _create_expense(client, auth_headers, amount="0")
    assert response.status_code == 422


def test_expense_subcategory_must_belong_to_category(client, auth_headers):
    response = _create_expense(client, auth_headers, category="Needs", subcategory="Shopping")
    assert response.status_code == 422
    assert "subcategory" in response.json()["message"]


def test_expense_invalid_category_rejected(client, auth_headers):
    response = _create_expense(client, auth_headers, category="Fun", subcategory="Food")
    assert response.status_code == 422


def test_user_cannot_read_another_users_expense(client, auth_headers, other_auth_headers):
    created = _create_expense(client, auth_headers).json()["data"]
    response = client.get(f"/api/v1/expenses/{created['id']}", headers=other_auth_headers)
    assert response.status_code == 404


def test_user_cannot_delete_another_users_expense(client, auth_headers, other_auth_headers):
    created = _create_expense(client, auth_headers).json()["data"]
    response = client.delete(f"/api/v1/expenses/{created['id']}", headers=other_auth_headers)
    assert response.status_code == 404


def test_expenses_scoped_to_current_user_in_list(client, auth_headers, other_auth_headers):
    _create_expense(client, auth_headers)
    _create_expense(client, other_auth_headers)

    response = client.get("/api/v1/expenses", headers=auth_headers)
    assert response.json()["data"]["count"] == 1


def test_delete_expense_success(client, auth_headers):
    created = _create_expense(client, auth_headers).json()["data"]
    response = client.delete(f"/api/v1/expenses/{created['id']}", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["message"] == "Expense deleted successfully"
    assert body["data"] is None
