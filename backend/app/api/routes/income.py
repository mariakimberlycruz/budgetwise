from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.income import IncomeCreate, IncomeList, IncomeOut, IncomeUpdate
from app.services.income import (
    IncomeNotFoundError,
    create_income,
    delete_income,
    get_income,
    list_income,
    update_income,
)

router = APIRouter(prefix="/income", tags=["income"])

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=IncomeList)
def list_income_endpoint(
    db: DbSession,
    current_user: CurrentUser,
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=1900, le=9999),
) -> IncomeList:
    return list_income(db, current_user.id, month=month, year=year)


@router.post("", response_model=IncomeOut, status_code=status.HTTP_201_CREATED)
def create_income_endpoint(
    payload: IncomeCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> IncomeOut:
    income = create_income(db, current_user.id, payload)
    return IncomeOut.model_validate(income)


@router.get("/{income_id}", response_model=IncomeOut)
def get_income_endpoint(
    income_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> IncomeOut:
    try:
        income = get_income(db, income_id, current_user.id)
    except IncomeNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    return IncomeOut.model_validate(income)


@router.put("/{income_id}", response_model=IncomeOut)
def update_income_endpoint(
    income_id: int,
    payload: IncomeUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> IncomeOut:
    try:
        income = update_income(db, income_id, current_user.id, payload)
    except IncomeNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    return IncomeOut.model_validate(income)


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income_endpoint(
    income_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    try:
        delete_income(db, income_id, current_user.id)
    except IncomeNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
