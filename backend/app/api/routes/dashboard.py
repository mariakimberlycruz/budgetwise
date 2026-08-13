from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard import get_dashboard

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=DashboardResponse)
def get_dashboard_endpoint(
    db: DbSession,
    current_user: CurrentUser,
    month: int = Query(ge=1, le=12),
    year: int = Query(ge=1900, le=9999),
) -> DashboardResponse:
    return get_dashboard(db, current_user.id, month, year)
