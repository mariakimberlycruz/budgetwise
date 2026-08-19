from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.envelope import EnvelopeRoute
from app.db.session import get_db
from app.models.user import User
from app.schemas.financial_health import FinancialHealthResponse
from app.services.financial_health import build_financial_health

router = APIRouter(prefix="/financial-health", tags=["financial-health"], route_class=EnvelopeRoute)

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=FinancialHealthResponse)
def financial_health_endpoint(
    db: DbSession,
    current_user: CurrentUser,
    month: int = Query(ge=1, le=12),
    year: int = Query(ge=1900, le=9999),
) -> FinancialHealthResponse:
    return build_financial_health(db, current_user.id, month, year)
