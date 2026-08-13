from pydantic import BaseModel


class HealthReason(BaseModel):
    tone: str  # 'good' | 'warning' | 'info'
    text: str


class FinancialHealthResponse(BaseModel):
    month: int
    year: int
    score: int
    status: str
    status_color: str
    components: dict[str, int]
    reasons: list[HealthReason]
