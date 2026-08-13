from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class IncomeCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    income_type: str = Field(min_length=1, max_length=50)
    description: str | None = Field(default=None, max_length=500)
    income_date: date


class IncomeUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    income_type: str | None = Field(default=None, min_length=1, max_length=50)
    description: str | None = Field(default=None, max_length=500)
    income_date: date | None = None


class IncomeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    amount: Decimal
    income_type: str
    description: str | None
    income_date: date
    created_at: datetime
    updated_at: datetime

    @field_serializer("amount")
    def serialize_amount(self, value: Decimal) -> str:
        return f"{value:.2f}"


class IncomeList(BaseModel):
    items: list[IncomeOut]
    total: Decimal
    count: int
    month: int | None
    year: int | None

    @field_serializer("total")
    def serialize_total(self, value: Decimal) -> str:
        return f"{value:.2f}"
