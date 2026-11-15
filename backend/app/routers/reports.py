from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

from app.deps import CurrentUser, DbSession
from app.models import Category, Expense, User
from app.schemas import (
    BudgetStatus,
    CategoryTotal,
    DailyPoint,
    DashboardOut,
    ReportOut,
    SafeDate,
)

router = APIRouter(prefix="/api/reports", tags=["reports"])

MAX_RANGE_DAYS = 366


def _totals(db: DbSession, user: User, start: date, end: date) -> tuple[Decimal, int]:
    total, count = db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0), func.count(Expense.id)).where(
            Expense.user_id == user.id, Expense.date >= start, Expense.date <= end
        )
    ).one()
    return Decimal(total), count


def _by_category(db: DbSession, user: User, start: date, end: date) -> list[CategoryTotal]:
    rows = db.execute(
        select(Expense.category_id, func.sum(Expense.amount), func.count(Expense.id))
        .where(Expense.user_id == user.id, Expense.date >= start, Expense.date <= end)
        .group_by(Expense.category_id)
        .order_by(func.sum(Expense.amount).desc())
    ).all()
    return [CategoryTotal(category_id=c, amount=a, count=n) for c, a, n in rows]


@router.get("/summary", response_model=ReportOut)
def summary(start: SafeDate, end: SafeDate, user: CurrentUser, db: DbSession) -> ReportOut:
    """Totals for [start, end] plus the same-length period immediately before it."""
    if end < start:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "End must be after start.")
    days = (end - start).days + 1
    if days > MAX_RANGE_DAYS:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Range is limited to one year.")

    total, count = _totals(db, user, start, end)
    previous_total, _ = _totals(db, user, start - timedelta(days=days), start - timedelta(days=1))

    daily_rows = dict(
        db.execute(
            select(Expense.date, func.sum(Expense.amount))
            .where(Expense.user_id == user.id, Expense.date >= start, Expense.date <= end)
            .group_by(Expense.date)
        ).all()
    )
    daily = [
        DailyPoint(date=day, amount=daily_rows.get(day, Decimal(0)))
        for day in (start + timedelta(days=i) for i in range(days))
    ]

    return ReportOut(
        start=start,
        end=end,
        total=total,
        count=count,
        previous_total=previous_total,
        daily=daily,
        by_category=_by_category(db, user, start, end),
    )


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(today: SafeDate, user: CurrentUser, db: DbSession) -> DashboardOut:
    """Glanceable numbers. `today` comes from the client so it matches the user's timezone."""
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    next_month = (month_start + timedelta(days=32)).replace(day=1)
    month_end = next_month - timedelta(days=1)

    today_total, today_count = _totals(db, user, today, today)
    week_total, week_count = _totals(db, user, week_start, week_start + timedelta(days=6))
    month_total, month_count = _totals(db, user, month_start, month_end)
    month_by_category = _by_category(db, user, month_start, month_end)

    spent = {row.category_id: row.amount for row in month_by_category}
    budgeted = db.execute(
        select(Category.id, Category.monthly_budget).where(
            Category.user_id == user.id, Category.monthly_budget.is_not(None)
        )
    ).all()

    return DashboardOut(
        today_total=today_total,
        today_count=today_count,
        week_total=week_total,
        week_count=week_count,
        month_total=month_total,
        month_count=month_count,
        monthly_budget=user.monthly_budget,
        month_by_category=month_by_category,
        category_budgets=[
            BudgetStatus(category_id=cid, budget=budget, spent=spent.get(cid, Decimal(0)))
            for cid, budget in budgeted
        ],
    )
