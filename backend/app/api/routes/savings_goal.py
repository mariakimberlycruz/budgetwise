from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.envelope import EnvelopeRoute
from app.db.session import get_db
from app.models.user import User
from app.schemas.savings_goal import (
    ContributionCreate,
    SavingsGoalCreate,
    SavingsGoalList,
    SavingsGoalOut,
    SavingsGoalUpdate,
)
from app.services.savings_goal import (
    add_contribution,
    create_savings_goal,
    delete_savings_goal,
    get_savings_goal_out,
    list_savings_goals,
    update_savings_goal,
)

router = APIRouter(prefix="/savings-goals", tags=["savings-goals"], route_class=EnvelopeRoute)

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=SavingsGoalList)
def list_savings_goals_endpoint(
    db: DbSession,
    current_user: CurrentUser,
) -> SavingsGoalList:
    return list_savings_goals(db, current_user.id)


@router.post("", response_model=SavingsGoalOut, status_code=status.HTTP_201_CREATED)
def create_savings_goal_endpoint(
    payload: SavingsGoalCreate,
    db: DbSession,
    current_user: CurrentUser,
    request: Request,
) -> SavingsGoalOut:
    request.state.message = "Savings goal created successfully"
    return create_savings_goal(db, current_user.id, payload)


@router.get("/{goal_id}", response_model=SavingsGoalOut)
def get_savings_goal_endpoint(
    goal_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> SavingsGoalOut:
    return get_savings_goal_out(db, goal_id, current_user.id)


@router.put("/{goal_id}", response_model=SavingsGoalOut)
def update_savings_goal_endpoint(
    goal_id: int,
    payload: SavingsGoalUpdate,
    db: DbSession,
    current_user: CurrentUser,
    request: Request,
) -> SavingsGoalOut:
    request.state.message = "Savings goal updated successfully"
    return update_savings_goal(db, goal_id, current_user.id, payload)


@router.delete("/{goal_id}")
def delete_savings_goal_endpoint(
    goal_id: int,
    db: DbSession,
    current_user: CurrentUser,
    request: Request,
) -> None:
    delete_savings_goal(db, goal_id, current_user.id)
    request.state.message = "Savings goal deleted successfully"


@router.post("/{goal_id}/contributions", response_model=SavingsGoalOut)
def add_contribution_endpoint(
    goal_id: int,
    payload: ContributionCreate,
    db: DbSession,
    current_user: CurrentUser,
    request: Request,
) -> SavingsGoalOut:
    request.state.message = "Contribution added successfully"
    return add_contribution(db, goal_id, current_user.id, payload)
