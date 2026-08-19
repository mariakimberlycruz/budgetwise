from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.envelope import EnvelopeRoute
from app.db.session import get_db
from app.models.user import User
from app.schemas.recurring_expense import (
    RecurringExpenseCreate,
    RecurringExpenseList,
    RecurringExpenseOut,
    RecurringExpenseUpdate,
)
from app.services.recurring_expense import (
    create_recurring_expense,
    delete_recurring_expense,
    get_recurring_expense,
    list_recurring_expenses,
    update_recurring_expense,
)

router = APIRouter(prefix="/recurring-expenses", tags=["recurring-expenses"], route_class=EnvelopeRoute)

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=RecurringExpenseList)
def list_recurring_expenses_endpoint(
    db: DbSession,
    current_user: CurrentUser,
    active: bool | None = Query(default=None),
) -> RecurringExpenseList:
    return list_recurring_expenses(db, current_user.id, active)


@router.post("", response_model=RecurringExpenseOut, status_code=status.HTTP_201_CREATED)
def create_recurring_expense_endpoint(
    payload: RecurringExpenseCreate,
    db: DbSession,
    current_user: CurrentUser,
    request: Request,
) -> RecurringExpenseOut:
    request.state.message = "Bill added successfully"
    return create_recurring_expense(db, current_user.id, payload)


@router.get("/{expense_id}", response_model=RecurringExpenseOut)
def get_recurring_expense_endpoint(
    expense_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> RecurringExpenseOut:
    return get_recurring_expense(db, expense_id, current_user.id)


@router.put("/{expense_id}", response_model=RecurringExpenseOut)
def update_recurring_expense_endpoint(
    expense_id: int,
    payload: RecurringExpenseUpdate,
    db: DbSession,
    current_user: CurrentUser,
    request: Request,
) -> RecurringExpenseOut:
    request.state.message = "Bill updated successfully"
    return update_recurring_expense(db, expense_id, current_user.id, payload)


@router.delete("/{expense_id}")
def delete_recurring_expense_endpoint(
    expense_id: int,
    db: DbSession,
    current_user: CurrentUser,
    request: Request,
) -> None:
    delete_recurring_expense(db, expense_id, current_user.id)
    request.state.message = "Bill deleted successfully"
