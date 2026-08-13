from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.savings_goal import SavingsGoal
from app.repositories.savings_goal import SavingsGoalRepository
from app.schemas.savings_goal import (
    ContributionCreate,
    SavingsGoalCreate,
    SavingsGoalList,
    SavingsGoalOut,
    SavingsGoalUpdate,
)


class SavingsGoalNotFoundError(Exception):
    pass


def _to_out(goal: SavingsGoal) -> SavingsGoalOut:
    remaining = max(goal.target_amount - goal.current_amount, Decimal("0"))
    progress = (
        round(goal.current_amount / goal.target_amount * 100)
        if goal.target_amount > 0
        else 0
    )
    return SavingsGoalOut(
        id=goal.id,
        user_id=goal.user_id,
        name=goal.name,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        remaining=remaining,
        progress_percent=min(progress, 100),
        target_date=goal.target_date,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
    )


def list_savings_goals(db: Session, user_id: int) -> SavingsGoalList:
    goals = SavingsGoalRepository.list_by_user(db, user_id)
    return SavingsGoalList(
        items=[_to_out(goal) for goal in goals],
        count=len(goals),
    )


def get_savings_goal(db: Session, goal_id: int, user_id: int) -> SavingsGoal:
    goal = SavingsGoalRepository.get_by_id_and_user(db, goal_id, user_id)
    if goal is None:
        raise SavingsGoalNotFoundError("Savings goal not found")
    return goal


def get_savings_goal_out(db: Session, goal_id: int, user_id: int) -> SavingsGoalOut:
    return _to_out(get_savings_goal(db, goal_id, user_id))


def create_savings_goal(db: Session, user_id: int, data: SavingsGoalCreate) -> SavingsGoalOut:
    goal = SavingsGoalRepository.create(db, user_id, data)
    return _to_out(goal)


def update_savings_goal(
    db: Session, goal_id: int, user_id: int, data: SavingsGoalUpdate
) -> SavingsGoalOut:
    goal = get_savings_goal(db, goal_id, user_id)
    goal = SavingsGoalRepository.update(db, goal, data)
    return _to_out(goal)


def add_contribution(
    db: Session, goal_id: int, user_id: int, data: ContributionCreate
) -> SavingsGoalOut:
    goal = get_savings_goal(db, goal_id, user_id)
    goal = SavingsGoalRepository.add_contribution(db, goal, data.amount)
    return _to_out(goal)


def delete_savings_goal(db: Session, goal_id: int, user_id: int) -> None:
    goal = get_savings_goal(db, goal_id, user_id)
    SavingsGoalRepository.delete(db, goal)
