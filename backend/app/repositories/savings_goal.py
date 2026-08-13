from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.savings_goal import SavingsGoal
from app.schemas.savings_goal import SavingsGoalCreate, SavingsGoalUpdate


class SavingsGoalRepository:
    @staticmethod
    def get_by_id_and_user(
        db: Session, goal_id: int, user_id: int
    ) -> SavingsGoal | None:
        return db.scalar(
            select(SavingsGoal).where(
                SavingsGoal.id == goal_id, SavingsGoal.user_id == user_id
            )
        )

    @staticmethod
    def list_by_user(db: Session, user_id: int) -> list[SavingsGoal]:
        stmt = (
            select(SavingsGoal)
            .where(SavingsGoal.user_id == user_id)
            .order_by(SavingsGoal.target_date.asc(), SavingsGoal.id.desc())
        )
        return list(db.scalars(stmt))

    @staticmethod
    def create(db: Session, user_id: int, data: SavingsGoalCreate) -> SavingsGoal:
        goal = SavingsGoal(
            user_id=user_id,
            name=data.name,
            target_amount=data.target_amount,
            current_amount=data.current_amount,
            target_date=data.target_date,
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)
        return goal

    @staticmethod
    def update(
        db: Session, goal: SavingsGoal, data: SavingsGoalUpdate
    ) -> SavingsGoal:
        goal.name = data.name
        goal.target_amount = data.target_amount
        goal.current_amount = data.current_amount
        goal.target_date = data.target_date
        db.commit()
        db.refresh(goal)
        return goal

    @staticmethod
    def add_contribution(db: Session, goal: SavingsGoal, amount: Decimal) -> SavingsGoal:
        goal.current_amount += amount
        db.commit()
        db.refresh(goal)
        return goal

    @staticmethod
    def delete(db: Session, goal: SavingsGoal) -> None:
        db.delete(goal)
        db.commit()
