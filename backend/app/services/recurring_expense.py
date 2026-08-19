import calendar
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models.recurring_expense import RecurringExpense
from app.repositories.recurring_expense import RecurringExpenseRepository
from app.schemas.recurring_expense import (
    RecurringExpenseCreate,
    RecurringExpenseList,
    RecurringExpenseOut,
    RecurringExpenseUpdate,
)


class RecurringExpenseNotFoundError(NotFoundError):
    pass


def _advance(frequency: str, year: int, month: int) -> tuple[int, int]:
    if frequency == "yearly":
        return year + 1, month
    month += 1
    if month > 12:
        month, year = 1, year + 1
    return year, month


def _cycle_date(year: int, month: int, day: int) -> date:
    last = calendar.monthrange(year, month)[1]
    return date(year, month, min(day, last))


def _current_and_next(
    start: date, frequency: str, due_day: int, today: date
) -> tuple[date | None, date]:
    """Return the occurrence for the cycle containing today and the next occurrence on/after today."""
    if start > today:
        return None, start

    if frequency == "weekly":
        occ = start
        prev: date | None = None
        guard = 0
        while occ < today and guard < 400:
            prev = occ
            occ = occ + timedelta(days=7)
            guard += 1
        return prev, occ

    cycle_year = today.year
    cycle_month = today.month if frequency == "monthly" else start.month
    current = _cycle_date(cycle_year, cycle_month, due_day)
    if current < start:
        current = None

    year, month = start.year, start.month
    cand = _cycle_date(year, month, due_day)
    if cand < start:
        year, month = _advance(frequency, year, month)
        cand = _cycle_date(year, month, due_day)
    guard = 0
    while cand < today and guard < 400:
        year, month = _advance(frequency, year, month)
        cand = _cycle_date(year, month, due_day)
        guard += 1
    return current, cand


def _compute_next_due(bill: RecurringExpense, today: date) -> tuple[date | None, bool]:
    current, next_due = _current_and_next(bill.start_date, bill.frequency, bill.due_day, today)
    overdue = bill.active and current is not None and current < today
    if bill.end_date is not None and next_due is not None and next_due > bill.end_date:
        return None, False
    return next_due, overdue


def _to_out(bill: RecurringExpense, today: date) -> RecurringExpenseOut:
    next_due, overdue = _compute_next_due(bill, today)
    return RecurringExpenseOut(
        id=bill.id,
        user_id=bill.user_id,
        name=bill.name,
        amount=bill.amount,
        category=bill.category,
        frequency=bill.frequency,
        due_day=bill.due_day,
        start_date=bill.start_date,
        end_date=bill.end_date,
        active=bill.active,
        next_due_date=next_due,
        overdue=overdue,
        created_at=bill.created_at,
        updated_at=bill.updated_at,
    )


def list_recurring_expenses(
    db: Session, user_id: int, active: bool | None = None
) -> RecurringExpenseList:
    today = datetime.now().date()
    bills = RecurringExpenseRepository.list_by_user(db, user_id, active)
    items = [_to_out(bill, today) for bill in bills]

    def sort_key(item: RecurringExpenseOut):
        due = item.next_due_date.isoformat() if item.next_due_date is not None else "9999-99-99"
        return (0 if item.active else 1, due, item.name.lower())

    items.sort(key=sort_key)
    overdue_count = sum(1 for item in items if item.overdue)
    upcoming_count = sum(
        1
        for item in items
        if item.active and item.next_due_date is not None and not item.overdue
    )
    return RecurringExpenseList(
        items=items,
        count=len(items),
        overdue_count=overdue_count,
        upcoming_count=upcoming_count,
    )


def get_recurring_expense(
    db: Session, expense_id: int, user_id: int
) -> RecurringExpenseOut:
    bill = RecurringExpenseRepository.get_by_id_and_user(db, expense_id, user_id)
    if bill is None:
        raise RecurringExpenseNotFoundError("Recurring expense not found")
    return _to_out(bill, datetime.now().date())


def create_recurring_expense(
    db: Session, user_id: int, data: RecurringExpenseCreate
) -> RecurringExpenseOut:
    bill = RecurringExpenseRepository.create(db, user_id, data)
    return _to_out(bill, datetime.now().date())


def update_recurring_expense(
    db: Session, expense_id: int, user_id: int, data: RecurringExpenseUpdate
) -> RecurringExpenseOut:
    bill = RecurringExpenseRepository.get_by_id_and_user(db, expense_id, user_id)
    if bill is None:
        raise RecurringExpenseNotFoundError("Recurring expense not found")
    bill = RecurringExpenseRepository.update(db, bill, data)
    return _to_out(bill, datetime.now().date())


def delete_recurring_expense(db: Session, expense_id: int, user_id: int) -> None:
    bill = RecurringExpenseRepository.get_by_id_and_user(db, expense_id, user_id)
    if bill is None:
        raise RecurringExpenseNotFoundError("Recurring expense not found")
    RecurringExpenseRepository.delete(db, bill)
