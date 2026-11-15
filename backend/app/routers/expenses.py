import csv
import io
import uuid
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import Select, func, or_, select

from app.deps import CurrentUser, DbSession
from app.models import Category, Expense, User
from app.routers.categories import get_owned_category
from app.schemas import (
    ExpenseIn,
    ExpenseOut,
    ExpensePage,
    ExpenseUpdate,
    ImportIn,
    ImportOut,
    SafeDate,
)

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

SortKey = Literal["date_desc", "date_asc", "amount_desc", "amount_asc"]

SORTS = {
    "date_desc": (Expense.date.desc(), Expense.created_at.desc()),
    "date_asc": (Expense.date.asc(), Expense.created_at.asc()),
    "amount_desc": (Expense.amount.desc(), Expense.date.desc()),
    "amount_asc": (Expense.amount.asc(), Expense.date.desc()),
}


class ExpenseFilters:
    def __init__(
        self,
        start: SafeDate | None = None,
        end: SafeDate | None = None,
        category_id: Annotated[uuid.UUID | None, Query(alias="categoryId")] = None,
        q: Annotated[str | None, Query(max_length=100)] = None,
    ):
        self.start = start
        self.end = end
        self.category_id = category_id
        self.q = q.strip() if q else None

    def apply(self, query: Select, user: User) -> Select:
        query = query.where(Expense.user_id == user.id)
        if self.start:
            query = query.where(Expense.date >= self.start)
        if self.end:
            query = query.where(Expense.date <= self.end)
        if self.category_id:
            query = query.where(Expense.category_id == self.category_id)
        if self.q:
            query = query.where(
                or_(
                    Expense.title.icontains(self.q, autoescape=True),
                    Expense.note.icontains(self.q, autoescape=True),
                )
            )
        return query


Filters = Annotated[ExpenseFilters, Depends()]


def _get_owned_expense(db: DbSession, user: User, expense_id: uuid.UUID) -> Expense:
    expense = db.get(Expense, expense_id)
    if expense is None or expense.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Expense not found.")
    return expense


@router.get("", response_model=ExpensePage)
def list_expenses(
    user: CurrentUser,
    db: DbSession,
    filters: Filters,
    sort: SortKey = "date_desc",
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> ExpensePage:
    totals = db.execute(
        filters.apply(
            select(func.count(Expense.id), func.coalesce(func.sum(Expense.amount), 0)), user
        )
    ).one()
    items = db.scalars(
        filters.apply(select(Expense), user).order_by(*SORTS[sort]).limit(limit).offset(offset)
    ).all()
    return ExpensePage(
        items=[ExpenseOut.model_validate(e) for e in items],
        total=totals[0],
        total_amount=totals[1],
    )


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(payload: ExpenseIn, user: CurrentUser, db: DbSession) -> Expense:
    get_owned_category(db, user, payload.category_id)
    expense = Expense(user_id=user.id, **payload.model_dump())
    db.add(expense)
    db.commit()
    return expense


@router.get("/export.csv")
def export_csv(
    user: CurrentUser,
    db: DbSession,
    filters: Filters,
) -> Response:
    rows = db.execute(
        filters.apply(
            select(Expense, Category.name).join(Category, Category.id == Expense.category_id),
            user,
        ).order_by(*SORTS["date_desc"])
    ).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Date", "Title", "Category", "Amount", "Note"])
    for expense, category_name in rows:
        writer.writerow(
            [
                expense.date.isoformat(),
                _csv_safe(expense.title),
                _csv_safe(category_name),
                f"{expense.amount:.2f}",
                _csv_safe(expense.note or ""),
            ]
        )
    return Response(
        content=buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="expenses.csv"'},
    )


def _csv_safe(value: str) -> str:
    """Stop spreadsheet apps from evaluating user text as a formula."""
    return f"'{value}" if value[:1] in ("=", "+", "-", "@", "\t", "\r") else value


@router.post("/import", response_model=ImportOut)
def import_expenses(payload: ImportIn, user: CurrentUser, db: DbSession) -> ImportOut:
    """Bulk import, matching categories by name and creating any that are missing."""
    categories = {
        c.name.lower(): c
        for c in db.scalars(select(Category).where(Category.user_id == user.id))
    }
    position = max((c.position for c in categories.values()), default=0)
    created = 0

    for item in payload.expenses:
        key = item.category_name.lower()
        category = categories.get(key)
        if category is None:
            position += 1
            category = Category(
                user_id=user.id,
                name=item.category_name,
                color=item.category_color or "#86949a",
                icon="custom",
                is_custom=True,
                position=position,
            )
            db.add(category)
            db.flush()
            categories[key] = category
            created += 1
        db.add(
            Expense(
                user_id=user.id,
                category_id=category.id,
                title=item.title,
                amount=item.amount,
                date=item.date,
                note=item.note,
            )
        )

    db.commit()
    return ImportOut(imported=len(payload.expenses), categories_created=created)


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(expense_id: uuid.UUID, user: CurrentUser, db: DbSession) -> Expense:
    return _get_owned_expense(db, user, expense_id)


@router.patch("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: uuid.UUID, payload: ExpenseUpdate, user: CurrentUser, db: DbSession
) -> Expense:
    expense = _get_owned_expense(db, user, expense_id)
    changes = payload.model_dump(exclude_unset=True)
    if changes.get("category_id"):
        get_owned_category(db, user, changes["category_id"])
    for field, value in changes.items():
        if value is None and field != "note":
            continue
        setattr(expense, field, value)
    db.commit()
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: uuid.UUID, user: CurrentUser, db: DbSession) -> None:
    db.delete(_get_owned_expense(db, user, expense_id))
    db.commit()
