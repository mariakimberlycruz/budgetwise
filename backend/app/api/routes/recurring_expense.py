from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.recurring_expense import (
    RecurringExpenseCreate,
    RecurringExpenseList,
    RecurringExpenseOut,
    RecurringExpenseUpdate,
)
from app.services.recurring_expense import (
    RecurringExpenseNotFoundError,
    create_recurring_expense,
    delete_recurring_expense,
    get_recurring_expense,
    list_recurring_expenses,
    update_recurring_expense,
)

router = APIRouter(prefix="/recurring-expenses", tags=["recurring-expenses"])

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
) -> RecurringExpenseOut:
    return create_recurring_expense(db, current_user.id, payload)


@router.get("/{expense_id}", response_model=RecurringExpenseOut)
def get_recurring_expense_endpoint(
    expense_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> RecurringExpenseOut:
    try:
        return get_recurring_expense(db, expense_id, current_user.id)
    except RecurringExpenseNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.put("/{expense_id}", response_model=RecurringExpenseOut)
def update_recurring_expense_endpoint(
    expense_id: int,
    payload: RecurringExpenseUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> RecurringExpenseOut:
    try:
        return update_recurring_expense(db, expense_id, current_user.id, payload)
    except RecurringExpenseNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurring_expense_endpoint(
    expense_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    try:
        delete_recurring_expense(db, expense_id, current_user.id)
    except RecurringExpenseNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
