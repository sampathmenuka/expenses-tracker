import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError

from app.deps import CurrentUser, DbSession
from app.models import Category, Expense, User
from app.schemas import CategoryIn, CategoryOut, CategoryUpdate

router = APIRouter(prefix="/api/categories", tags=["categories"])


def get_owned_category(db: DbSession, user: User, category_id: uuid.UUID) -> Category:
    category = db.get(Category, category_id)
    if category is None or category.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found.")
    return category


def _ensure_unique_name(
    db: DbSession, user: User, name: str, exclude_id: uuid.UUID | None = None
) -> None:
    query = select(Category.id).where(
        Category.user_id == user.id, func.lower(Category.name) == name.lower()
    )
    if exclude_id is not None:
        query = query.where(Category.id != exclude_id)
    if db.scalar(query):
        raise HTTPException(status.HTTP_409_CONFLICT, "That category already exists.")


def _commit_or_conflict(db: DbSession) -> None:
    """A concurrent request may claim the same name between our check and the insert."""
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "That category already exists.") from None


def _with_count(category: Category, count: int) -> CategoryOut:
    out = CategoryOut.model_validate(category)
    out.expense_count = count
    return out


@router.get("", response_model=list[CategoryOut])
def list_categories(user: CurrentUser, db: DbSession) -> list[CategoryOut]:
    counts = (
        select(Expense.category_id, func.count().label("n"))
        .where(Expense.user_id == user.id)
        .group_by(Expense.category_id)
        .subquery()
    )
    rows = db.execute(
        select(Category, func.coalesce(counts.c.n, 0))
        .outerjoin(counts, counts.c.category_id == Category.id)
        .where(Category.user_id == user.id)
        .order_by(Category.position, Category.name)
    ).all()
    return [_with_count(category, count) for category, count in rows]


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryIn, user: CurrentUser, db: DbSession) -> CategoryOut:
    _ensure_unique_name(db, user, payload.name)
    last_position = db.scalar(
        select(func.max(Category.position)).where(Category.user_id == user.id)
    )
    category = Category(
        user_id=user.id,
        name=payload.name,
        color=payload.color,
        icon="custom",
        is_custom=True,
        monthly_budget=payload.monthly_budget,
        position=(last_position or 0) + 1,
    )
    db.add(category)
    _commit_or_conflict(db)
    return _with_count(category, 0)


@router.patch("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: uuid.UUID, payload: CategoryUpdate, user: CurrentUser, db: DbSession
) -> CategoryOut:
    category = get_owned_category(db, user, category_id)
    changes = payload.model_dump(exclude_unset=True)
    if changes.get("name"):
        _ensure_unique_name(db, user, changes["name"], exclude_id=category.id)
    for field, value in changes.items():
        if field in ("name", "color") and value is None:
            continue
        setattr(category, field, value)
    _commit_or_conflict(db)
    count = db.scalar(select(func.count()).where(Expense.category_id == category.id)) or 0
    return _with_count(category, count)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: uuid.UUID, user: CurrentUser, db: DbSession) -> None:
    """Delete a custom category, moving its expenses into the fallback category."""
    category = get_owned_category(db, user, category_id)
    if not category.is_custom or category.is_fallback:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Built-in categories can't be deleted.")

    fallback = db.scalar(
        select(Category).where(Category.user_id == user.id, Category.is_fallback.is_(True))
    )
    if fallback is None:
        raise HTTPException(status.HTTP_409_CONFLICT, "No fallback category to move expenses into.")

    db.execute(
        update(Expense)
        .where(Expense.category_id == category.id)
        .values(category_id=fallback.id)
    )
    db.delete(category)
    db.commit()
