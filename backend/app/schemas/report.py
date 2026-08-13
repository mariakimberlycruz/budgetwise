from decimal import Decimal

from pydantic import BaseModel, field_serializer


class ReportBudgetItem(BaseModel):
    category: str
    budget: Decimal
    actual: Decimal
    remaining: Decimal
    usage_percent: int

    @field_serializer("budget", "actual", "remaining")
    def serialize_decimal(self, value: Decimal) -> str:
        return f"{value:.2f}"


class ReportCategorySpend(BaseModel):
    category: str
    amount: Decimal
    percent: int

    @field_serializer("amount")
    def serialize_amount(self, value: Decimal) -> str:
        return f"{value:.2f}"


class ReportTrendPoint(BaseModel):
    month: int
    year: int
    income: Decimal
    expenses: Decimal
    remaining: Decimal

    @field_serializer("income", "expenses", "remaining")
    def serialize_decimal(self, value: Decimal) -> str:
        return f"{value:.2f}"


class ReportSavingsGoal(BaseModel):
    id: int
    name: str
    current_amount: Decimal
    target_amount: Decimal
    progress_percent: int

    @field_serializer("current_amount", "target_amount")
    def serialize_decimal(self, value: Decimal) -> str:
        return f"{value:.2f}"


class MonthlyReport(BaseModel):
    month: int
    year: int
    total_income: Decimal
    total_expenses: Decimal
    total_remaining_money: Decimal
    needs_budget: Decimal
    needs_actual: Decimal
    needs_remaining: Decimal
    savings_budget: Decimal
    savings_actual: Decimal
    savings_remaining: Decimal
    wants_budget: Decimal
    wants_actual: Decimal
    wants_remaining: Decimal
    budget_items: list[ReportBudgetItem]
    spending_by_category: list[ReportCategorySpend]
    trend: list[ReportTrendPoint]
    savings_goals: list[ReportSavingsGoal]

    @field_serializer(
        "total_income",
        "total_expenses",
        "total_remaining_money",
        "needs_budget",
        "needs_actual",
        "needs_remaining",
        "savings_budget",
        "savings_actual",
        "savings_remaining",
        "wants_budget",
        "wants_actual",
        "wants_remaining",
    )
    def serialize_decimal(self, value: Decimal) -> str:
        return f"{value:.2f}"
