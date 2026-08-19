"""Exact-value tests for the financial health score formula
(app.services.financial_health.build_financial_health): needs 30pts,
wants 25pts, savings 25pts, budget discipline 20pts, each hand-computed
from the same weights/neutral-ratio constants the service uses.
"""


def _set_budget(client, headers, category, amount, month=8, year=2026):
    client.put(
        "/api/v1/budgets",
        json={"category": category, "amount": amount, "month": month, "year": year},
        headers=headers,
    )


def _create_expense(client, headers, amount, category, subcategory="Food", date="2026-08-05"):
    client.post(
        "/api/v1/expenses",
        json={"amount": amount, "category": category, "subcategory": subcategory, "expense_date": date},
        headers=headers,
    )


def _get_health(client, headers, month=8, year=2026):
    return client.get("/api/v1/financial-health", params={"month": month, "year": year}, headers=headers)


def test_score_with_no_budgets_uses_neutral_defaults(client, auth_headers):
    # needs 0.75*30=22.5, wants 0.75*25=18.75, savings 0.5*25=12.5,
    # discipline 0.5*100=50 -> 0.5*20=10 => 63.75 -> round -> 64, "Good"
    response = _get_health(client, auth_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["score"] == 64
    assert data["status"] == "Good"


def test_score_when_well_within_budget_is_excellent(client, auth_headers):
    _set_budget(client, auth_headers, "Needs", "1000.00")
    _create_expense(client, auth_headers, "300.00", "Needs")  # 30% usage
    _set_budget(client, auth_headers, "Wants", "500.00")
    _create_expense(client, auth_headers, "100.00", "Wants", subcategory="Shopping")  # 20% usage
    _set_budget(client, auth_headers, "Savings", "200.00")
    _create_expense(client, auth_headers, "200.00", "Savings", subcategory="Bank Savings")  # 100% usage

    response = _get_health(client, auth_headers)
    data = response.json()["data"]
    # needs 100/100*30=30, wants 100/100*25=25, savings 100/100*25=25,
    # discipline ~16.47 -> round(96.47) = 96
    assert data["score"] == 96
    assert data["status"] == "Excellent"
    assert data["components"] == {"needs": 30, "wants": 25, "savings": 25, "budget": 16}


def test_score_when_over_budget_needs_attention(client, auth_headers):
    _set_budget(client, auth_headers, "Needs", "100.00")
    _create_expense(client, auth_headers, "150.00", "Needs")  # 150% usage, over budget

    response = _get_health(client, auth_headers)
    data = response.json()["data"]
    # needs usage 150% -> _usage_score = 0 -> 0 pts; wants/savings neutral
    # (18.75 + 12.5); discipline clamped to 0 => total 31.25 -> round -> 31
    assert data["score"] == 31
    assert data["status"] == "Needs Attention"
    assert any("over budget" in reason["text"].lower() for reason in data["reasons"])


def test_score_is_between_0_and_100(client, auth_headers):
    _set_budget(client, auth_headers, "Needs", "10.00")
    _create_expense(client, auth_headers, "500.00", "Needs")

    response = _get_health(client, auth_headers)
    score = response.json()["data"]["score"]
    assert 0 <= score <= 100


def test_financial_health_requires_authentication(client):
    response = client.get("/api/v1/financial-health", params={"month": 8, "year": 2026})
    assert response.status_code == 401
