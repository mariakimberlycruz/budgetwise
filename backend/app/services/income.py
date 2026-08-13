from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.income import Income
from app.repositories.income import IncomeRepository
from app.schemas.income import IncomeCreate, IncomeList, IncomeOut, IncomeUpdate


class IncomeNotFoundError(Exception):
    pass


def list_income(
    db: Session,
    user_id: int,
    month: int | None = None,
    year: int | None = None,
) -> IncomeList:
    items = IncomeRepository.list_by_user(db, user_id, month=month, year=year)
    total = sum((item.amount for item in items), Decimal("0"))
    return IncomeList(
        items=[IncomeOut.model_validate(item) for item in items],
        total=total,
        count=len(items),
        month=month,
        year=year,
    )


def get_income(db: Session, income_id: int, user_id: int) -> Income:
    income = IncomeRepository.get_by_id_and_user(db, income_id, user_id)
    if income is None:
        raise IncomeNotFoundError("Income not found")
    return income


def create_income(db: Session, user_id: int, data: IncomeCreate) -> Income:
    return IncomeRepository.create(db, user_id, data)


def update_income(db: Session, income_id: int, user_id: int, data: IncomeUpdate) -> Income:
    income = get_income(db, income_id, user_id)
    return IncomeRepository.update(db, income, data)


def delete_income(db: Session, income_id: int, user_id: int) -> None:
    income = get_income(db, income_id, user_id)
    IncomeRepository.delete(db, income)
