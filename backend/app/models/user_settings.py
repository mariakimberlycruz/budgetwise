from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

DEFAULT_PERCENTAGES = {"needs": 50, "savings": 30, "wants": 20}
DEFAULT_CURRENCY = "PHP"
DEFAULT_THEME = "system"
VALID_THEMES = ("light", "dark", "system")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default=DEFAULT_CURRENCY)
    budget_needs: Mapped[int] = mapped_column(Integer, nullable=False, default=DEFAULT_PERCENTAGES["needs"])
    budget_savings: Mapped[int] = mapped_column(Integer, nullable=False, default=DEFAULT_PERCENTAGES["savings"])
    budget_wants: Mapped[int] = mapped_column(Integer, nullable=False, default=DEFAULT_PERCENTAGES["wants"])
    theme: Mapped[str] = mapped_column(String(12), nullable=False, default=DEFAULT_THEME)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="settings")

    def __repr__(self) -> str:
        return f"<UserSettings id={self.id} user_id={self.user_id} currency={self.currency!r}>"
