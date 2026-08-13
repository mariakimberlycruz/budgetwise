from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user_settings import UserSettings
from app.schemas.settings import SettingsUpdate


class UserSettingsRepository:
    @staticmethod
    def get_by_user(db: Session, user_id: int) -> UserSettings | None:
        return db.scalar(select(UserSettings).where(UserSettings.user_id == user_id))

    @staticmethod
    def create_default(db: Session, user_id: int) -> UserSettings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
        return settings

    @staticmethod
    def update(db: Session, settings: UserSettings, data: SettingsUpdate) -> UserSettings:
        settings.currency = data.currency
        settings.budget_needs = data.budget_needs
        settings.budget_savings = data.budget_savings
        settings.budget_wants = data.budget_wants
        settings.theme = data.theme
        db.commit()
        db.refresh(settings)
        return settings
