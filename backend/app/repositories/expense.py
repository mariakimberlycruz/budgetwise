from decimal import Decimal

from sqlalchemy import extract, func, or_, select
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


class ExpenseRepository:
    @staticmethod
    def get_by_id_and_user(db: Session, expense_id: int, user_id: int) -> Expense | None:
        return db.scalar(
            select(Expense).where(Expense.id == expense_id, Expense.user_id == user_id)
        )

    @staticmethod
    def list_by_user(
        db: Session,
        user_id: int,
        month: int | None = None,
        year: int | None = None,
        category: str | None = None,
        subcategory: str | None = None,
        q: str | None = None,
    ) -> list[Expense]:
        stmt = select(Expense).where(Expense.user_id == user_id)
        if month is not None:
            stmt = stmt.where(extract("month", Expense.expense_date) == month)
        if year is not None:
            stmt = stmt.where(extract("year", Expense.expense_date) == year)
        if category is not None:
            stmt = stmt.where(Expense.category == category)
        if subcategory is not None:
            stmt = stmt.where(Expense.subcategory == subcategory)
        if q:
            pattern = f"%{q}%"
            stmt = stmt.where(
                or_(
                    Expense.description.ilike(pattern),
                    Expense.subcategory.ilike(pattern),
                    Expense.category.ilike(pattern),
                )
            )
        stmt = stmt.order_by(Expense.expense_date.desc(), Expense.id.desc())
        return list(db.scalars(stmt))

    @staticmethod
    def spending_by_category(
        db: Session, user_id: int, month: int, year: int
    ) -> dict[str, Decimal]:
        rows = db.execute(
            select(Expense.category, func.coalesce(func.sum(Expense.amount), 0))
            .where(Expense.user_id == user_id)
            .where(extract("month", Expense.expense_date) == month)
            .where(extract("year", Expense.expense_date) == year)
            .group_by(Expense.category)
        ).all()
        return {category: amount for category, amount in rows}

    @staticmethod
    def create(db: Session, user_id: int, data: ExpenseCreate) -> Expense:
        expense = Expense(
            user_id=user_id,
            amount=data.amount,
            category=data.category,
            subcategory=data.subcategory,
            description=data.description,
            expense_date=data.expense_date,
        )
        db.add(expense)
        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def update(db: Session, expense: Expense, data: ExpenseUpdate) -> Expense:
        expense.amount = data.amount
        expense.category = data.category
        expense.subcategory = data.subcategory
        expense.description = data.description
        expense.expense_date = data.expense_date
        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def delete(db: Session, expense: Expense) -> None:
        db.delete(expense)
        db.commit()
