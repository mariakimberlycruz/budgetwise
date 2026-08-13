from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.user_settings import VALID_THEMES


class SettingsUpdate(BaseModel):
    currency: str = Field(default="PHP", min_length=3, max_length=8)
    budget_needs: int = Field(ge=0, le=100)
    budget_savings: int = Field(ge=0, le=100)
    budget_wants: int = Field(ge=0, le=100)
    theme: str = Field(default="system")

    @model_validator(mode="after")
    def validate_settings(self) -> "SettingsUpdate":
        if self.theme not in VALID_THEMES:
            raise ValueError("theme must be one of light, dark, system")
        total = self.budget_needs + self.budget_savings + self.budget_wants
        if total != 100:
            raise ValueError("Budget percentages must add up to 100%")
        return self


class SettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    currency: str
    budget_needs: int
    budget_savings: int
    budget_wants: int
    theme: str
