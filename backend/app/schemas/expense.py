from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator, model_validator

from app.models.category import EXPENSE_CATEGORIES


class ExpenseCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    category: str = Field(min_length=1, max_length=32)
    subcategory: str = Field(min_length=1, max_length=50)
    description: str | None = Field(default=None, max_length=500)
    expense_date: date

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        if value not in EXPENSE_CATEGORIES:
            raise ValueError("category must be one of Needs, Savings, Wants")
        return value

    @model_validator(mode="after")
    def validate_subcategory_belongs(self) -> "ExpenseCreate":
        if self.subcategory not in EXPENSE_CATEGORIES[self.category]:
            raise ValueError("subcategory does not belong to the selected category")
        return self


class ExpenseUpdate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    category: str = Field(min_length=1, max_length=32)
    subcategory: str = Field(min_length=1, max_length=50)
    description: str | None = Field(default=None, max_length=500)
    expense_date: date

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        if value not in EXPENSE_CATEGORIES:
            raise ValueError("category must be one of Needs, Savings, Wants")
        return value

    @model_validator(mode="after")
    def validate_subcategory_belongs(self) -> "ExpenseUpdate":
        if self.subcategory not in EXPENSE_CATEGORIES[self.category]:
            raise ValueError("subcategory does not belong to the selected category")
        return self


class ExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    amount: Decimal
    category: str
    subcategory: str
    description: str | None
    expense_date: date
    created_at: datetime
    updated_at: datetime

    @field_serializer("amount")
    def serialize_amount(self, value: Decimal) -> str:
        return f"{value:.2f}"


class CategorySpending(BaseModel):
    category: str
    spending: Decimal
    budget: Decimal | None
    remaining: Decimal | None

    @field_serializer("spending", "budget", "remaining")
    def serialize_decimal(self, value: Decimal | None) -> str | None:
        return f"{value:.2f}" if value is not None else None


class ExpenseList(BaseModel):
    items: list[ExpenseOut]
    total: Decimal
    count: int
    month: int | None
    year: int | None
    category: str | None
    subcategory: str | None
    q: str | None
    category_spending: list[CategorySpending]

    @field_serializer("total")
    def serialize_total(self, value: Decimal) -> str:
        return f"{value:.2f}"
