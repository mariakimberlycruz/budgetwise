from datetime import date
from decimal import Decimal

from pydantic import BaseModel, field_serializer


class DashboardBudget(BaseModel):
    category: str
    budget: Decimal
    spent: Decimal
    remaining: Decimal
    usage_percent: int

    @field_serializer("budget", "spent", "remaining")
    def serialize_decimal(self, value: Decimal) -> str:
        return f"{value:.2f}"


class DashboardRecentExpense(BaseModel):
    id: int
    amount: Decimal
    category: str
    subcategory: str
    description: str | None
    expense_date: date

    @field_serializer("amount")
    def serialize_amount(self, value: Decimal) -> str:
        return f"{value:.2f}"


class DashboardResponse(BaseModel):
    month: int
    year: int
    monthly_income: Decimal
    total_expenses: Decimal
    remaining_money: Decimal
    budgets: list[DashboardBudget]
    recent_expenses: list[DashboardRecentExpense]

    @field_serializer("monthly_income", "total_expenses", "remaining_money")
    def serialize_decimal(self, value: Decimal) -> str:
        return f"{value:.2f}"
