from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError, UnauthorizedError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserUpdate


class DuplicateEmailError(ConflictError):
    pass


class InvalidCredentialsError(UnauthorizedError):
    pass


class UserNotFoundError(NotFoundError):
    pass


def register_user(db: Session, data: UserCreate) -> User:
    if UserRepository.get_by_email(db, data.email):
        raise DuplicateEmailError("An account with this email already exists")
    hashed = hash_password(data.password)
    return UserRepository.create(db, data, hashed)


def authenticate_user(db: Session, data: UserLogin) -> User:
    user = UserRepository.get_by_email(db, data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise InvalidCredentialsError("Incorrect email or password")
    return user


def issue_access_token(user: User) -> Token:
    return Token(access_token=create_access_token(user.id))


def get_user_by_id(db: Session, user_id: int) -> User:
    user = UserRepository.get_by_id(db, user_id)
    if user is None:
        raise UserNotFoundError("User not found")
    return user


def update_user_profile(db: Session, user: User, data: UserUpdate) -> User:
    if data.email is not None and data.email.lower() != user.email.lower():
        existing = UserRepository.get_by_email(db, data.email)
        if existing is not None and existing.id != user.id:
            raise DuplicateEmailError("An account with this email already exists")
        user.email = data.email
    if data.name is not None and data.name.strip():
        user.name = data.name.strip()
    db.commit()
    db.refresh(user)
    return user
