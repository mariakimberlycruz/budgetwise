from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class SavingsGoalCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    target_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    current_amount: Decimal = Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    target_date: date


class SavingsGoalUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    target_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    current_amount: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    target_date: date


class ContributionCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)


class SavingsGoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    target_amount: Decimal
    current_amount: Decimal
    remaining: Decimal
    progress_percent: int
    target_date: date
    created_at: datetime
    updated_at: datetime

    @field_serializer("target_amount", "current_amount", "remaining")
    def serialize_decimal(self, value: Decimal) -> str:
        return f"{value:.2f}"


class SavingsGoalList(BaseModel):
    items: list[SavingsGoalOut]
    count: int
