from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.recurring_expense import RecurringExpense
from app.schemas.recurring_expense import RecurringExpenseCreate, RecurringExpenseUpdate


class RecurringExpenseRepository:
    @staticmethod
    def get_by_id_and_user(db: Session, expense_id: int, user_id: int) -> RecurringExpense | None:
        return db.scalar(
            select(RecurringExpense).where(
                RecurringExpense.id == expense_id,
                RecurringExpense.user_id == user_id,
            )
        )

    @staticmethod
    def list_by_user(
        db: Session, user_id: int, active: bool | None = None
    ) -> list[RecurringExpense]:
        stmt = select(RecurringExpense).where(RecurringExpense.user_id == user_id)
        if active is not None:
            stmt = stmt.where(RecurringExpense.active == active)
        return list(db.scalars(stmt))

    @staticmethod
    def create(
        db: Session, user_id: int, data: RecurringExpenseCreate
    ) -> RecurringExpense:
        expense = RecurringExpense(
            user_id=user_id,
            name=data.name,
            amount=data.amount,
            category=data.category,
            frequency=data.frequency,
            due_day=data.due_day,
            start_date=data.start_date,
            end_date=data.end_date,
            active=data.active,
        )
        db.add(expense)
        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def update(
        db: Session, expense: RecurringExpense, data: RecurringExpenseUpdate
    ) -> RecurringExpense:
        expense.name = data.name
        expense.amount = data.amount
        expense.category = data.category
        expense.frequency = data.frequency
        expense.due_day = data.due_day
        expense.start_date = data.start_date
        expense.end_date = data.end_date
        expense.active = data.active
        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def delete(db: Session, expense: RecurringExpense) -> None:
        db.delete(expense)
        db.commit()
