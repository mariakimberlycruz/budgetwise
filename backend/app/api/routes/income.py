from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.envelope import EnvelopeRoute
from app.db.session import get_db
from app.models.user import User
from app.schemas.income import IncomeCreate, IncomeList, IncomeOut, IncomeUpdate
from app.services.income import (
    create_income,
    delete_income,
    get_income,
    list_income,
    update_income,
)

router = APIRouter(prefix="/income", tags=["income"], route_class=EnvelopeRoute)

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
    request: Request,
) -> IncomeOut:
    income = create_income(db, current_user.id, payload)
    request.state.message = "Income added successfully"
    return IncomeOut.model_validate(income)


@router.get("/{income_id}", response_model=IncomeOut)
def get_income_endpoint(
    income_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> IncomeOut:
    income = get_income(db, income_id, current_user.id)
    return IncomeOut.model_validate(income)


@router.put("/{income_id}", response_model=IncomeOut)
def update_income_endpoint(
    income_id: int,
    payload: IncomeUpdate,
    db: DbSession,
    current_user: CurrentUser,
    request: Request,
) -> IncomeOut:
    income = update_income(db, income_id, current_user.id, payload)
    request.state.message = "Income updated successfully"
    return IncomeOut.model_validate(income)


@router.delete("/{income_id}")
def delete_income_endpoint(
    income_id: int,
    db: DbSession,
    current_user: CurrentUser,
    request: Request,
) -> None:
    delete_income(db, income_id, current_user.id)
    request.state.message = "Income deleted successfully"
