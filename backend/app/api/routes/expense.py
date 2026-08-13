from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseList, ExpenseOut, ExpenseUpdate
from app.services.expense import (
    ExpenseNotFoundError,
    create_expense,
    delete_expense,
    get_expense,
    list_expenses,
    update_expense,
)

router = APIRouter(prefix="/expenses", tags=["expenses"])

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
) -> ExpenseOut:
    expense = create_expense(db, current_user.id, payload)
    return ExpenseOut.model_validate(expense)


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense_endpoint(
    expense_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> ExpenseOut:
    try:
        expense = get_expense(db, expense_id, current_user.id)
    except ExpenseNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    return ExpenseOut.model_validate(expense)


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense_endpoint(
    expense_id: int,
    payload: ExpenseUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> ExpenseOut:
    try:
        expense = update_expense(db, expense_id, current_user.id, payload)
    except ExpenseNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    return ExpenseOut.model_validate(expense)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense_endpoint(
    expense_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    try:
        delete_expense(db, expense_id, current_user.id)
    except ExpenseNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
