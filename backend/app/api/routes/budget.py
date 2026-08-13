from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.budget import BudgetOut, BudgetSet, BudgetSummary
from app.services.budget import get_budget_summary, set_budget

router = APIRouter(prefix="/budgets", tags=["budgets"])

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=BudgetSummary)
def get_budgets_endpoint(
    db: DbSession,
    current_user: CurrentUser,
    month: int = Query(ge=1, le=12),
    year: int = Query(ge=1900, le=9999),
) -> BudgetSummary:
    return get_budget_summary(db, current_user.id, month, year)


@router.put("", response_model=BudgetOut, status_code=status.HTTP_200_OK)
def set_budget_endpoint(
    payload: BudgetSet,
    db: DbSession,
    current_user: CurrentUser,
) -> BudgetOut:
    budget = set_budget(db, current_user.id, payload)
    return BudgetOut.model_validate(budget)
