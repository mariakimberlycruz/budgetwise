from datetime import date

from sqlalchemy import extract, select
from sqlalchemy.orm import Session

from app.models.income import Income
from app.schemas.income import IncomeCreate, IncomeUpdate


class IncomeRepository:
    @staticmethod
    def get_by_id_and_user(db: Session, income_id: int, user_id: int) -> Income | None:
        return db.scalar(
            select(Income).where(Income.id == income_id, Income.user_id == user_id)
        )

    @staticmethod
    def list_by_user(
        db: Session,
        user_id: int,
        month: int | None = None,
        year: int | None = None,
    ) -> list[Income]:
        stmt = select(Income).where(Income.user_id == user_id)
        if month is not None:
            stmt = stmt.where(extract("month", Income.income_date) == month)
        if year is not None:
            stmt = stmt.where(extract("year", Income.income_date) == year)
        stmt = stmt.order_by(Income.income_date.desc(), Income.id.desc())
        return list(db.scalars(stmt))

    @staticmethod
    def create(db: Session, user_id: int, data: IncomeCreate) -> Income:
        income = Income(
            user_id=user_id,
            amount=data.amount,
            income_type=data.income_type,
            description=data.description,
            income_date=data.income_date,
        )
        db.add(income)
        db.commit()
        db.refresh(income)
        return income

    @staticmethod
    def update(db: Session, income: Income, data: IncomeUpdate) -> Income:
        updates = data.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(income, field, value)
        db.commit()
        db.refresh(income)
        return income

    @staticmethod
    def delete(db: Session, income: Income) -> None:
        db.delete(income)
        db.commit()
