from decimal import Decimal

from sqlalchemy.orm import Session

from app.repositories.budget import BudgetRepository
from app.repositories.expense import ExpenseRepository
from app.schemas.financial_health import FinancialHealthResponse, HealthReason

# Weight on a 100-point scale.
WEIGHTS = {"needs": 30, "wants": 25, "savings": 25, "budget": 20}
# Neutral score ratio (0-1) used when a category has no budget to evaluate.
NEUTRAL = {"needs": 0.75, "wants": 0.75, "savings": 0.5, "budget": 0.5}


def _fmt(value: Decimal) -> str:
    return f"₱{value:,.2f}"


def _usage_score(usage_pct: float) -> float:
    """How healthy a category's usage is, on a 0-100 scale."""
    if usage_pct <= 50:
        return 100.0
    if usage_pct <= 100:
        # linear 100 -> 40 over 50% -> 100%
        return 100.0 - 120.0 * (usage_pct - 50.0) / 50.0
    if usage_pct <= 140:
        # linear 40 -> 0 over 100% -> 140%
        return 40.0 - 100.0 * (usage_pct - 100.0) / 40.0
    return 0.0


def _savings_score(progress_pct: float) -> float:
    return max(0.0, min(100.0, progress_pct))


def build_financial_health(
    db: Session, user_id: int, month: int, year: int
) -> FinancialHealthResponse:
    spending = ExpenseRepository.spending_by_category(db, user_id, month, year)
    budgets = BudgetRepository.list_for_month(db, user_id, month, year)

    def cat(category: str) -> tuple[Decimal, Decimal, Decimal, float | None]:
        budget = budgets.get(category, Decimal("0"))
        actual = spending.get(category, Decimal("0"))
        remaining = budget - actual
        usage = (float(actual) / float(budget) * 100.0) if budget > 0 else None
        return budget, actual, remaining, usage

    needs_b, needs_a, needs_r, needs_usage = cat("Needs")
    wants_b, wants_a, wants_r, wants_usage = cat("Wants")
    sav_b, sav_a, sav_r, sav_usage = cat("Savings")

    total_budget = needs_b + wants_b + sav_b
    total_remaining = needs_r + wants_r + sav_r
    total_over = sum(max(Decimal("0"), -r) for r in (needs_r, wants_r, sav_r))

    reasons: list[HealthReason] = []

    # --- Needs (30 pts) ---
    needs_pts = (
        _usage_score(needs_usage) / 100.0 * WEIGHTS["needs"]
        if needs_usage is not None
        else NEUTRAL["needs"] * WEIGHTS["needs"]
    )
    if needs_usage is not None:
        if needs_usage > 100:
            reasons.append(
                HealthReason(tone="warning", text=f"Needs is over budget by {_fmt(-needs_r)}.")
            )
        elif needs_usage >= 90:
            reasons.append(
                HealthReason(tone="warning", text=f"Needs usage is high ({needs_usage:.0f}%).")
            )
        elif needs_usage <= 75:
            reasons.append(HealthReason(tone="good", text="Needs spending within budget."))

    # --- Wants (25 pts) ---
    wants_pts = (
        _usage_score(wants_usage) / 100.0 * WEIGHTS["wants"]
        if wants_usage is not None
        else NEUTRAL["wants"] * WEIGHTS["wants"]
    )
    if wants_usage is not None:
        if wants_usage > 100:
            reasons.append(
                HealthReason(tone="warning", text=f"Wants is over budget by {_fmt(-wants_r)}.")
            )
        elif wants_usage >= 90:
            reasons.append(
                HealthReason(tone="warning", text=f"Wants spending is high ({wants_usage:.0f}%).")
            )
        elif wants_usage <= 75:
            reasons.append(HealthReason(tone="good", text="Wants spending within budget."))

    # --- Savings (25 pts) ---
    if sav_usage is not None:
        savings_pts = _savings_score(sav_usage) / 100.0 * WEIGHTS["savings"]
        if sav_usage >= 100:
            reasons.append(HealthReason(tone="good", text="Savings target reached."))
        elif sav_usage >= 75:
            reasons.append(HealthReason(tone="good", text="Savings target almost reached."))
        else:
            reasons.append(
                HealthReason(tone="info", text=f"Savings progress is low ({sav_usage:.0f}%).")
            )
    else:
        savings_pts = NEUTRAL["savings"] * WEIGHTS["savings"]

    # --- Budget discipline (20 pts): remaining budget + overage penalty ---
    if total_budget > 0:
        remaining_ratio = float(total_remaining) / float(total_budget)
        overage_frac = float(total_over) / float(total_budget)
        discipline_score = max(
            0.0,
            min(
                100.0,
                100.0 * (0.5 + remaining_ratio / 2.0) - 100.0 * overage_frac,
            ),
        )
        if total_remaining > 0:
            reasons.append(
                HealthReason(
                    tone="good",
                    text=f"You have {_fmt(total_remaining)} remaining in your budget.",
                )
            )
        elif total_remaining < 0:
            reasons.append(
                HealthReason(
                    tone="warning",
                    text=f"You are over budget by {_fmt(-total_remaining)}.",
                )
            )
        for cname, remaining in (("Needs", needs_r), ("Wants", wants_r), ("Savings", sav_r)):
            if remaining < 0:
                reasons.append(
                    HealthReason(
                        tone="warning",
                        text=f"{cname} exceeded its budget by {_fmt(-remaining)}.",
                    )
                )
    else:
        discipline_score = NEUTRAL["budget"] * 100.0
    discipline_pts = discipline_score / 100.0 * WEIGHTS["budget"]

    total_raw = needs_pts + wants_pts + savings_pts + discipline_pts
    score = int(round(max(0.0, min(100.0, total_raw))))

    if score >= 80:
        status, status_color = "Excellent", "#16A34A"
    elif score >= 60:
        status, status_color = "Good", "#22C55E"
    elif score >= 40:
        status, status_color = "Fair", "#F59E0B"
    else:
        status, status_color = "Needs Attention", "#DC2626"

    if not reasons:
        reasons.append(
            HealthReason(tone="good", text="Your finances are in good shape. Keep it up!")
        )

    return FinancialHealthResponse(
        month=month,
        year=year,
        score=score,
        status=status,
        status_color=status_color,
        components={
            "needs": int(round(needs_pts)),
            "wants": int(round(wants_pts)),
            "savings": int(round(savings_pts)),
            "budget": int(round(discipline_pts)),
        },
        reasons=reasons,
    )

