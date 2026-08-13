from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.category import BUDGET_CATEGORIES
from app.repositories.budget import BudgetRepository
from app.repositories.expense import ExpenseRepository
from app.schemas.budget import BudgetSet, BudgetSummary, BudgetSummaryItem


def get_budget_summary(db: Session, user_id: int, month: int, year: int) -> BudgetSummary:
    budgets = BudgetRepository.list_for_month(db, user_id, month, year)
    spending = ExpenseRepository.spending_by_category(db, user_id, month, year)

    items: list[BudgetSummaryItem] = []
    total_budget = Decimal("0")
    total_spending = Decimal("0")
    for category in BUDGET_CATEGORIES:
        budget_amount = budgets.get(category, Decimal("0"))
        spending_amount = spending.get(category, Decimal("0"))
        items.append(
            BudgetSummaryItem(
                category=category,
                budget=budget_amount,
                spending=spending_amount,
                remaining=budget_amount - spending_amount,
            )
        )
        total_budget += budget_amount
        total_spending += spending_amount

    return BudgetSummary(
        month=month,
        year=year,
        total_budget=total_budget,
        total_spending=total_spending,
        total_remaining=total_budget - total_spending,
        items=items,
    )


def set_budget(db: Session, user_id: int, data: BudgetSet) -> Budget:
    return BudgetRepository.upsert(
        db,
        user_id,
        data.category,
        data.month,
        data.year,
        data.amount,
    )
