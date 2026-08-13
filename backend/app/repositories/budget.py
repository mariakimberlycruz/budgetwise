from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.budget import Budget


class BudgetRepository:
    @staticmethod
    def list_for_month(db: Session, user_id: int, month: int, year: int) -> dict[str, Decimal]:
        rows = db.scalars(
            select(Budget).where(
                Budget.user_id == user_id,
                Budget.month == month,
                Budget.year == year,
            )
        )
        return {row.category: row.amount for row in rows}

    @staticmethod
    def get(db: Session, user_id: int, category: str, month: int, year: int) -> Budget | None:
        return db.scalar(
            select(Budget).where(
                Budget.user_id == user_id,
                Budget.category == category,
                Budget.month == month,
                Budget.year == year,
            )
        )

    @staticmethod
    def upsert(
        db: Session,
        user_id: int,
        category: str,
        month: int,
        year: int,
        amount: Decimal,
    ) -> Budget:
        budget = BudgetRepository.get(db, user_id, category, month, year)
        if budget is None:
            budget = Budget(
                user_id=user_id,
                category=category,
                amount=amount,
                month=month,
                year=year,
            )
            db.add(budget)
        else:
            budget.amount = amount
        db.commit()
        db.refresh(budget)
        return budget
