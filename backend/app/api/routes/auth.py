from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.envelope import EnvelopeRoute
from app.db.session import get_db
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserOut, UserUpdate
from app.services.auth import (
    authenticate_user,
    issue_access_token,
    register_user,
    update_user_profile,
)

router = APIRouter(prefix="/auth", tags=["auth"], route_class=EnvelopeRoute)

DbSession = Annotated[Session, Depends(get_db)]


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: DbSession, request: Request) -> UserOut:
    user = register_user(db, payload)
    request.state.message = "Account created successfully"
    return UserOut.model_validate(user)


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: DbSession, request: Request) -> Token:
    user = authenticate_user(db, payload)
    request.state.message = "Login successful"
    return issue_access_token(user)


@router.get("/me", response_model=UserOut)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> UserOut:
    return UserOut.model_validate(current_user)


@router.put("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: DbSession,
    request: Request,
) -> UserOut:
    user = update_user_profile(db, current_user, payload)
    request.state.message = "Profile updated successfully"
    return UserOut.model_validate(user)
