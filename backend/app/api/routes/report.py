from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.report import MonthlyReport
from app.services.report import build_monthly_report

router = APIRouter(prefix="/reports", tags=["reports"])

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("/monthly", response_model=MonthlyReport)
def monthly_report_endpoint(
    db: DbSession,
    current_user: CurrentUser,
    month: int = Query(ge=1, le=12),
    year: int = Query(ge=1900, le=9999),
) -> MonthlyReport:
    return build_monthly_report(db, current_user.id, month, year)
