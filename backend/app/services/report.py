from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.category import BUDGET_CATEGORIES
from app.repositories.budget import BudgetRepository
from app.repositories.expense import ExpenseRepository
from app.repositories.income import IncomeRepository
from app.repositories.savings_goal import SavingsGoalRepository
from app.schemas.report import (
    MonthlyReport,
    ReportBudgetItem,
    ReportCategorySpend,
    ReportSavingsGoal,
    ReportTrendPoint,
)

TREND_MONTHS = 6


def _month_sequence(month: int, year: int, count: int) -> list[tuple[int, int]]:
    """Chronological (oldest -> newest) list of (year, month) covering `count` months."""
    result: list[tuple[int, int]] = []
    for offset in range(count - 1, -1, -1):
        total = month - offset
        y = year + (total - 1) // 12
        m = (total - 1) % 12 + 1
        result.append((y, m))
    return result


def _sum_amounts(objs) -> Decimal:
    return sum((obj.amount for obj in objs), Decimal("0"))


def build_monthly_report(
    db: Session,
    user_id: int,
    month: int,
    year: int,
    trend_months: int = TREND_MONTHS,
) -> MonthlyReport:
    income = _sum_amounts(
        IncomeRepository.list_by_user(db, user_id, month=month, year=year)
    )
    expenses = _sum_amounts(
        ExpenseRepository.list_by_user(db, user_id, month=month, year=year)
    )
    spending = ExpenseRepository.spending_by_category(db, user_id, month, year)
    budgets = BudgetRepository.list_for_month(db, user_id, month, year)

    budget_items: list[ReportBudgetItem] = []
    per_category: dict[str, tuple[Decimal, Decimal, Decimal]] = {}
    for category in BUDGET_CATEGORIES:
        budget_amount = budgets.get(category, Decimal("0"))
        actual = spending.get(category, Decimal("0"))
        remaining = budget_amount - actual
        usage = round(actual / budget_amount * 100) if budget_amount > 0 else 0
        per_category[category] = (budget_amount, actual, remaining)
        budget_items.append(
            ReportBudgetItem(
                category=category,
                budget=budget_amount,
                actual=actual,
                remaining=remaining,
                usage_percent=usage,
            )
        )

    spending_by_category = [
        ReportCategorySpend(
            category=category,
            amount=spending.get(category, Decimal("0")),
            percent=round(spending.get(category, Decimal("0")) / expenses * 100)
            if expenses > 0
            else 0,
        )
        for category in BUDGET_CATEGORIES
    ]

    trend = [
        ReportTrendPoint(
            month=tm,
            year=ty,
            income=_sum_amounts(
                IncomeRepository.list_by_user(db, user_id, month=tm, year=ty)
            ),
            expenses=_sum_amounts(
                ExpenseRepository.list_by_user(db, user_id, month=tm, year=ty)
            ),
            remaining=Decimal("0"),
        )
        for ty, tm in _month_sequence(month, year, trend_months)
    ]
    for point in trend:
        point.remaining = point.income - point.expenses

    savings_goals = [
        ReportSavingsGoal(
            id=goal.id,
            name=goal.name,
            current_amount=goal.current_amount,
            target_amount=goal.target_amount,
            progress_percent=min(
                round(goal.current_amount / goal.target_amount * 100)
                if goal.target_amount > 0
                else 0,
                100,
            ),
        )
        for goal in SavingsGoalRepository.list_by_user(db, user_id)
    ]

    needs_budget, needs_actual, needs_remaining = per_category["Needs"]
    savings_budget, savings_actual, savings_remaining = per_category["Savings"]
    wants_budget, wants_actual, wants_remaining = per_category["Wants"]

    return MonthlyReport(
        month=month,
        year=year,
        total_income=income,
        total_expenses=expenses,
        total_remaining_money=income - expenses,
        needs_budget=needs_budget,
        needs_actual=needs_actual,
        needs_remaining=needs_remaining,
        savings_budget=savings_budget,
        savings_actual=savings_actual,
        savings_remaining=savings_remaining,
        wants_budget=wants_budget,
        wants_actual=wants_actual,
        wants_remaining=wants_remaining,
        budget_items=budget_items,
        spending_by_category=spending_by_category,
        trend=trend,
        savings_goals=savings_goals,
    )
