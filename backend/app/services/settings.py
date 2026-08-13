from sqlalchemy.orm import Session

from app.repositories.settings import UserSettingsRepository
from app.schemas.settings import SettingsOut, SettingsUpdate


def get_settings(db: Session, user_id: int) -> SettingsOut:
    settings = UserSettingsRepository.get_by_user(db, user_id)
    if settings is None:
        settings = UserSettingsRepository.create_default(db, user_id)
    return SettingsOut.model_validate(settings)


def update_settings(db: Session, user_id: int, data: SettingsUpdate) -> SettingsOut:
    settings = UserSettingsRepository.get_by_user(db, user_id)
    if settings is None:
        settings = UserSettingsRepository.create_default(db, user_id)
    settings = UserSettingsRepository.update(db, settings, data)
    return SettingsOut.model_validate(settings)
