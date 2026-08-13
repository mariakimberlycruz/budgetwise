from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator

from app.models.category import BUDGET_CATEGORIES


class BudgetSet(BaseModel):
    category: str = Field(min_length=1, max_length=32)
    amount: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=1900, le=9999)

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        if value not in BUDGET_CATEGORIES:
            raise ValueError("category must be one of Needs, Savings, Wants")
        return value


class BudgetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    category: str
    amount: Decimal
    month: int
    year: int

    @field_serializer("amount")
    def serialize_amount(self, value: Decimal) -> str:
        return f"{value:.2f}"


class BudgetSummaryItem(BaseModel):
    category: str
    budget: Decimal
    spending: Decimal
    remaining: Decimal

    @field_serializer("budget", "spending", "remaining")
    def serialize_decimal(self, value: Decimal) -> str:
        return f"{value:.2f}"


class BudgetSummary(BaseModel):
    month: int
    year: int
    total_budget: Decimal
    total_spending: Decimal
    total_remaining: Decimal
    items: list[BudgetSummaryItem]

    @field_serializer("total_budget", "total_spending", "total_remaining")
    def serialize_decimal(self, value: Decimal) -> str:
        return f"{value:.2f}"
