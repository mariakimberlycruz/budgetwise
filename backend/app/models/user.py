from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.budget import Budget
    from app.models.expense import Expense
    from app.models.income import Income
    from app.models.recurring_expense import RecurringExpense
    from app.models.savings_goal import SavingsGoal


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    income_records: Mapped[list["Income"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    expense_records: Mapped[list["Expense"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    budget_records: Mapped[list["Budget"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    savings_goals: Mapped[list["SavingsGoal"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    recurring_expenses: Mapped[list["RecurringExpense"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    settings: Mapped["UserSettings"] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"
