from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate


class UserRepository:
    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        return db.scalar(select(User).where(User.email == email))

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User | None:
        return db.get(User, user_id)

    @staticmethod
    def create(db: Session, data: UserCreate, password_hash: str) -> User:
        user = User(name=data.name, email=data.email, password_hash=password_hash)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
