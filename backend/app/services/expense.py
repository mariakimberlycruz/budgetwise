from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models.category import BUDGET_CATEGORIES
from app.models.expense import Expense
from app.repositories.budget import BudgetRepository
from app.repositories.expense import ExpenseRepository
from app.schemas.expense import (
    CategorySpending,
    ExpenseCreate,
    ExpenseList,
    ExpenseOut,
    ExpenseUpdate,
)


class ExpenseNotFoundError(NotFoundError):
    pass


def list_expenses(
    db: Session,
    user_id: int,
    month: int | None = None,
    year: int | None = None,
    category: str | None = None,
    subcategory: str | None = None,
    q: str | None = None,
) -> ExpenseList:
    items = ExpenseRepository.list_by_user(
        db,
        user_id,
        month=month,
        year=year,
        category=category,
        subcategory=subcategory,
        q=q,
    )
    total = sum((item.amount for item in items), Decimal("0"))

    category_spending: list[CategorySpending] = []
    if month is not None and year is not None:
        spending = ExpenseRepository.spending_by_category(db, user_id, month, year)
        budgets = BudgetRepository.list_for_month(db, user_id, month, year)
        for budget_category in BUDGET_CATEGORIES:
            spending_amount = spending.get(budget_category, Decimal("0"))
            budget_amount = budgets.get(budget_category)
            remaining = (
                budget_amount - spending_amount if budget_amount is not None else None
            )
            category_spending.append(
                CategorySpending(
                    category=budget_category,
                    spending=spending_amount,
                    budget=budget_amount,
                    remaining=remaining,
                )
            )

    return ExpenseList(
        items=[ExpenseOut.model_validate(item) for item in items],
        total=total,
        count=len(items),
        month=month,
        year=year,
        category=category,
        subcategory=subcategory,
        q=q,
        category_spending=category_spending,
    )


def get_expense(db: Session, expense_id: int, user_id: int) -> Expense:
    expense = ExpenseRepository.get_by_id_and_user(db, expense_id, user_id)
    if expense is None:
        raise ExpenseNotFoundError("Expense not found")
    return expense


def create_expense(db: Session, user_id: int, data: ExpenseCreate) -> Expense:
    return ExpenseRepository.create(db, user_id, data)


def update_expense(db: Session, expense_id: int, user_id: int, data: ExpenseUpdate) -> Expense:
    expense = get_expense(db, expense_id, user_id)
    return ExpenseRepository.update(db, expense, data)


def delete_expense(db: Session, expense_id: int, user_id: int) -> None:
    expense = get_expense(db, expense_id, user_id)
    ExpenseRepository.delete(db, expense)
