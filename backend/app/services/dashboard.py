from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.category import BUDGET_CATEGORIES
from app.repositories.budget import BudgetRepository
from app.repositories.expense import ExpenseRepository
from app.repositories.income import IncomeRepository
from app.schemas.dashboard import (
    DashboardBudget,
    DashboardRecentExpense,
    DashboardResponse,
)

RECENT_EXPENSES_LIMIT = 5


def get_dashboard(db: Session, user_id: int, month: int, year: int) -> DashboardResponse:
    incomes = IncomeRepository.list_by_user(db, user_id, month=month, year=year)
    monthly_income = sum((income.amount for income in incomes), Decimal("0"))

    month_expenses = ExpenseRepository.list_by_user(db, user_id, month=month, year=year)
    total_expenses = sum((expense.amount for expense in month_expenses), Decimal("0"))

    spending = ExpenseRepository.spending_by_category(db, user_id, month, year)
    budgets = BudgetRepository.list_for_month(db, user_id, month, year)

    dashboard_budgets: list[DashboardBudget] = []
    for category in BUDGET_CATEGORIES:
        budget_amount = budgets.get(category, Decimal("0"))
        spent = spending.get(category, Decimal("0"))
        usage_percent = round(spent / budget_amount * 100) if budget_amount > 0 else 0
        dashboard_budgets.append(
            DashboardBudget(
                category=category,
                budget=budget_amount,
                spent=spent,
                remaining=budget_amount - spent,
                usage_percent=usage_percent,
            )
        )

    recent_expenses = ExpenseRepository.list_by_user(db, user_id)[:RECENT_EXPENSES_LIMIT]

    return DashboardResponse(
        month=month,
        year=year,
        monthly_income=monthly_income,
        total_expenses=total_expenses,
        remaining_money=monthly_income - total_expenses,
        budgets=dashboard_budgets,
        recent_expenses=[
            DashboardRecentExpense(
                id=expense.id,
                amount=expense.amount,
                category=expense.category,
                subcategory=expense.subcategory,
                description=expense.description,
                expense_date=expense.expense_date,
            )
            for expense in recent_expenses
        ],
    )
