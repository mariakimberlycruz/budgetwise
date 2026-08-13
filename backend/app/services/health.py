from datetime import datetime, timezone

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.schemas.health import HealthResponse


def get_health(db: Session) -> HealthResponse:
    settings = get_settings()

    try:
        db.execute(text("SELECT 1"))
        database_status = "connected"
    except Exception:
        database_status = "error"

    return HealthResponse(
        status="ok",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        database=database_status,
        timestamp=datetime.now(timezone.utc),
    )
