from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
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
    SavingsGoalNotFoundError,
    add_contribution,
    create_savings_goal,
    delete_savings_goal,
    get_savings_goal_out,
    list_savings_goals,
    update_savings_goal,
)

router = APIRouter(prefix="/savings-goals", tags=["savings-goals"])

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
) -> SavingsGoalOut:
    return create_savings_goal(db, current_user.id, payload)


@router.get("/{goal_id}", response_model=SavingsGoalOut)
def get_savings_goal_endpoint(
    goal_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> SavingsGoalOut:
    try:
        return get_savings_goal_out(db, goal_id, current_user.id)
    except SavingsGoalNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.put("/{goal_id}", response_model=SavingsGoalOut)
def update_savings_goal_endpoint(
    goal_id: int,
    payload: SavingsGoalUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> SavingsGoalOut:
    try:
        return update_savings_goal(db, goal_id, current_user.id, payload)
    except SavingsGoalNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_savings_goal_endpoint(
    goal_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    try:
        delete_savings_goal(db, goal_id, current_user.id)
    except SavingsGoalNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.post("/{goal_id}/contributions", response_model=SavingsGoalOut)
def add_contribution_endpoint(
    goal_id: int,
    payload: ContributionCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> SavingsGoalOut:
    try:
        return add_contribution(db, goal_id, current_user.id, payload)
    except SavingsGoalNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
