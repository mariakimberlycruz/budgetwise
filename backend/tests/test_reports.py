def _create_income(client, headers, amount, date="2026-08-01"):
    client.post(
        "/api/v1/income",
        json={"amount": amount, "income_type": "Salary", "income_date": date},
        headers=headers,
    )


def _create_expense(client, headers, amount, category, subcategory="Food", date="2026-08-05"):
    client.post(
        "/api/v1/expenses",
        json={"amount": amount, "category": category, "subcategory": subcategory, "expense_date": date},
        headers=headers,
    )


def _set_budget(client, headers, category, amount, month=8, year=2026):
    client.put(
        "/api/v1/budgets",
        json={"category": category, "amount": amount, "month": month, "year": year},
        headers=headers,
    )


def test_report_totals_are_correct(client, auth_headers):
    _create_income(client, auth_headers, "2000.00")
    _create_income(client, auth_headers, "500.00")
    _create_expense(client, auth_headers, "300.00", "Needs")
    _create_expense(client, auth_headers, "200.00", "Wants", subcategory="Shopping")

    response = client.get("/api/v1/reports/monthly", params={"month": 8, "year": 2026}, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total_income"] == "2500.00"
    assert data["total_expenses"] == "500.00"
    assert data["total_remaining_money"] == "2000.00"


def test_report_budget_vs_actual_is_correct(client, auth_headers):
    _set_budget(client, auth_headers, "Needs", "400.00")
    _create_expense(client, auth_headers, "300.00", "Needs")

    response = client.get("/api/v1/reports/monthly", params={"month": 8, "year": 2026}, headers=auth_headers)
    data = response.json()["data"]
    needs_item = next(item for item in data["budget_items"] if item["category"] == "Needs")
    assert needs_item["budget"] == "400.00"
    assert needs_item["actual"] == "300.00"
    assert needs_item["remaining"] == "100.00"
    assert needs_item["usage_percent"] == 75


def test_report_spending_percentages_sum_close_to_100(client, auth_headers):
    _create_expense(client, auth_headers, "300.00", "Needs")
    _create_expense(client, auth_headers, "100.00", "Wants", subcategory="Shopping")

    response = client.get("/api/v1/reports/monthly", params={"month": 8, "year": 2026}, headers=auth_headers)
    breakdown = {item["category"]: item["percent"] for item in response.json()["data"]["spending_by_category"]}
    assert breakdown["Needs"] == 75
    assert breakdown["Wants"] == 25
    assert breakdown["Savings"] == 0


def test_report_scoped_to_current_user(client, auth_headers, other_auth_headers):
    _create_income(client, auth_headers, "1000.00")
    _create_income(client, other_auth_headers, "9999.00")

    response = client.get("/api/v1/reports/monthly", params={"month": 8, "year": 2026}, headers=auth_headers)
    assert response.json()["data"]["total_income"] == "1000.00"
