from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.envelope import EnvelopeRoute
from app.db.session import get_db
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseList, ExpenseOut, ExpenseUpdate
from app.services.expense import (
    create_expense,
    delete_expense,
    get_expense,
    list_expenses,
    update_expense,
)

router = APIRouter(prefix="/expenses", tags=["expenses"], route_class=EnvelopeRoute)

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=ExpenseList)
def list_expenses_endpoint(
    db: DbSession,
    current_user: CurrentUser,
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=1900, le=9999),
    category: str | None = Query(default=None, max_length=32),
    subcategory: str | None = Query(default=None, max_length=50),
    q: str | None = Query(default=None, max_length=200),
) -> ExpenseList:
    return list_expenses(
        db,
        current_user.id,
        month=month,
        year=year,
        category=category,
        subcategory=subcategory,
        q=q,
    )


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense_endpoint(
    payload: ExpenseCreate,
    db: DbSession,
    current_user: CurrentUser,
    request: Request,
) -> ExpenseOut:
    expense = create_expense(db, current_user.id, payload)
    request.state.message = "Expense created successfully"
    return ExpenseOut.model_validate(expense)


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense_endpoint(
    expense_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> ExpenseOut:
    expense = get_expense(db, expense_id, current_user.id)
    return ExpenseOut.model_validate(expense)


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense_endpoint(
    expense_id: int,
    payload: ExpenseUpdate,
    db: DbSession,
    current_user: CurrentUser,
    request: Request,
) -> ExpenseOut:
    expense = update_expense(db, expense_id, current_user.id, payload)
    request.state.message = "Expense updated successfully"
    return ExpenseOut.model_validate(expense)


@router.delete("/{expense_id}")
def delete_expense_endpoint(
    expense_id: int,
    db: DbSession,
    current_user: CurrentUser,
    request: Request,
) -> None:
    delete_expense(db, expense_id, current_user.id)
    request.state.message = "Expense deleted successfully"
