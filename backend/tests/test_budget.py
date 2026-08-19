def _set_budget(client, headers, category, amount, month=8, year=2026):
    return client.put(
        "/api/v1/budgets",
        json={"category": category, "amount": amount, "month": month, "year": year},
        headers=headers,
    )


def _create_expense(client, headers, amount, category, subcategory="Food", date="2026-08-05"):
    return client.post(
        "/api/v1/expenses",
        json={"amount": amount, "category": category, "subcategory": subcategory, "expense_date": date},
        headers=headers,
    )


def test_budget_amount_cannot_be_negative(client, auth_headers):
    response = _set_budget(client, auth_headers, "Needs", "-100")
    assert response.status_code == 422


def test_budget_invalid_category_rejected(client, auth_headers):
    response = _set_budget(client, auth_headers, "Fun", "100")
    assert response.status_code == 422


def test_budget_calculations_are_correct(client, auth_headers):
    _set_budget(client, auth_headers, "Needs", "1000.00")
    _create_expense(client, auth_headers, "300.00", "Needs")
    _create_expense(client, auth_headers, "150.00", "Needs")

    response = client.get("/api/v1/budgets", params={"month": 8, "year": 2026}, headers=auth_headers)
    assert response.status_code == 200
    items = {item["category"]: item for item in response.json()["data"]["items"]}

    needs = items["Needs"]
    assert needs["budget"] == "1000.00"
    assert needs["spending"] == "450.00"
    assert needs["remaining"] == "550.00"

    totals = response.json()["data"]
    assert totals["total_budget"] == "1000.00"
    assert totals["total_spending"] == "450.00"
    assert totals["total_remaining"] == "550.00"


def test_budget_expenses_outside_month_are_excluded(client, auth_headers):
    _set_budget(client, auth_headers, "Wants", "200.00")
    _create_expense(client, auth_headers, "50.00", "Wants", subcategory="Shopping", date="2026-07-15")

    response = client.get("/api/v1/budgets", params={"month": 8, "year": 2026}, headers=auth_headers)
    wants = {item["category"]: item for item in response.json()["data"]["items"]}["Wants"]
    assert wants["spending"] == "0.00"


def test_budgets_scoped_to_current_user(client, auth_headers, other_auth_headers):
    _set_budget(client, auth_headers, "Savings", "500.00")

    response = client.get("/api/v1/budgets", params={"month": 8, "year": 2026}, headers=other_auth_headers)
    savings = {item["category"]: item for item in response.json()["data"]["items"]}["Savings"]
    assert savings["budget"] == "0.00"
