from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.settings import SettingsOut, SettingsUpdate
from app.services.settings import get_settings, update_settings

router = APIRouter(prefix="/settings", tags=["settings"])

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=SettingsOut)
def read_settings_endpoint(db: DbSession, current_user: CurrentUser) -> SettingsOut:
    return get_settings(db, current_user.id)


@router.put("", response_model=SettingsOut)
def write_settings_endpoint(
    payload: SettingsUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> SettingsOut:
    return update_settings(db, current_user.id, payload)
