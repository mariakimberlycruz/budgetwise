from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator, model_validator

from app.models.category import BUDGET_CATEGORIES, RECURRING_FREQUENCIES


class RecurringExpenseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    category: str = Field(min_length=1, max_length=32)
    frequency: str = Field(min_length=1, max_length=20)
    due_day: int = Field(ge=1, le=31)
    start_date: date
    end_date: date | None = None
    active: bool = True

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        if value not in BUDGET_CATEGORIES:
            raise ValueError("category must be one of Needs, Savings, Wants")
        return value

    @field_validator("frequency")
    @classmethod
    def validate_frequency(cls, value: str) -> str:
        if value not in RECURRING_FREQUENCIES:
            raise ValueError("frequency must be one of monthly, weekly, yearly")
        return value

    @model_validator(mode="after")
    def validate_due_day_and_dates(self) -> "RecurringExpenseCreate":
        if self.frequency == "weekly" and not (1 <= self.due_day <= 7):
            raise ValueError("due_day must be between 1 and 7 for weekly frequency")
        if self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class RecurringExpenseUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    category: str = Field(min_length=1, max_length=32)
    frequency: str = Field(min_length=1, max_length=20)
    due_day: int = Field(ge=1, le=31)
    start_date: date
    end_date: date | None = None
    active: bool = True

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        if value not in BUDGET_CATEGORIES:
            raise ValueError("category must be one of Needs, Savings, Wants")
        return value

    @field_validator("frequency")
    @classmethod
    def validate_frequency(cls, value: str) -> str:
        if value not in RECURRING_FREQUENCIES:
            raise ValueError("frequency must be one of monthly, weekly, yearly")
        return value

    @model_validator(mode="after")
    def validate_due_day_and_dates(self) -> "RecurringExpenseUpdate":
        if self.frequency == "weekly" and not (1 <= self.due_day <= 7):
            raise ValueError("due_day must be between 1 and 7 for weekly frequency")
        if self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class RecurringExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    amount: Decimal
    category: str
    frequency: str
    due_day: int
    start_date: date
    end_date: date | None
    active: bool
    next_due_date: date | None
    overdue: bool
    created_at: datetime
    updated_at: datetime

    @field_serializer("amount")
    def serialize_amount(self, value: Decimal) -> str:
        return f"{value:.2f}"

    @field_serializer("next_due_date")
    def serialize_next_due(self, value: date | None) -> str | None:
        return value.isoformat() if value is not None else None


class RecurringExpenseList(BaseModel):
    items: list[RecurringExpenseOut]
    count: int
    overdue_count: int
    upcoming_count: int
