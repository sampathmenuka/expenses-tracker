import calendar
import statistics
from collections import Counter, defaultdict
from datetime import date, timedelta
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.deps import CurrentUser, DbSession
from app.models import Expense, User
from app.schemas import (
    CategoryTotal,
    DailyPoint,
    ExpenseOut,
    FrequentItem,
    MonthBucket,
    MonthCompare,
    PacingOut,
    SafeDate,
    TrendsOut,
    TrendStats,
    WeekdayStat,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

ZERO = Decimal(0)


def _month_start(day: date, months_back: int = 0) -> date:
    index = day.year * 12 + (day.month - 1) - months_back
    return date(index // 12, index % 12 + 1, 1)


def _days_in_month(start: date) -> int:
    return calendar.monthrange(start.year, start.month)[1]


def _daily_by_category(
    db: DbSession, user: User, start: date, end: date
) -> list[tuple[date, object, Decimal]]:
    return db.execute(
        select(Expense.date, Expense.category_id, func.sum(Expense.amount))
        .where(Expense.user_id == user.id, Expense.date >= start, Expense.date <= end)
        .group_by(Expense.date, Expense.category_id)
    ).all()


@router.get("/pacing", response_model=PacingOut)
def pacing(today: SafeDate, user: CurrentUser, db: DbSession) -> PacingOut:
    """Day-by-day spend this month and last, so the UI can show cumulative pace."""
    this_start = _month_start(today)
    last_start = _month_start(today, 1)
    this_days = _days_in_month(this_start)
    last_days = _days_in_month(last_start)
    this_end = this_start + timedelta(days=this_days - 1)

    this_daily = [ZERO] * this_days
    last_daily = [ZERO] * last_days
    this_cat: dict = defaultdict(lambda: ZERO)
    last_cat: dict = defaultdict(lambda: ZERO)
    last_cat_to_date: dict = defaultdict(lambda: ZERO)

    for day, category_id, amount in _daily_by_category(db, user, last_start, this_end):
        if day >= this_start:
            this_daily[day.day - 1] += amount
            this_cat[category_id] += amount
        else:
            last_daily[day.day - 1] += amount
            last_cat[category_id] += amount
            if day.day <= today.day:
                last_cat_to_date[category_id] += amount

    # Compare like with like: last month up to the same day number.
    same_point = sum(last_daily[: min(today.day, last_days)], ZERO)
    categories = sorted(
        set(this_cat) | set(last_cat),
        key=lambda c: (this_cat[c] - last_cat_to_date[c]),
        reverse=True,
    )

    return PacingOut(
        month_start=this_start,
        days_in_month=this_days,
        days_elapsed=today.day,
        this_month_daily=this_daily,
        last_month_daily=last_daily,
        this_month_total=sum(this_daily, ZERO),
        last_month_total=sum(last_daily, ZERO),
        last_month_same_point=same_point,
        monthly_budget=user.monthly_budget,
        by_category=[
            MonthCompare(
                category_id=c,
                this_month=this_cat[c],
                last_month=last_cat[c],
                last_month_to_date=last_cat_to_date[c],
            )
            for c in categories
        ],
    )


@router.get("/trends", response_model=TrendsOut)
def trends(
    today: SafeDate,
    user: CurrentUser,
    db: DbSession,
    months: Annotated[int, Query(ge=1, le=24)] = 6,
) -> TrendsOut:
    """Spending patterns over the last `months` calendar months, ending today."""
    start = _month_start(today, months - 1)
    end = today
    days = (end - start).days + 1

    rows = db.execute(
        select(Expense)
        .where(Expense.user_id == user.id, Expense.date >= start, Expense.date <= end)
        .order_by(Expense.date)
    ).scalars().all()

    daily: dict[date, Decimal] = defaultdict(lambda: ZERO)
    monthly: dict[str, dict] = {
        _month_start(today, back).strftime("%Y-%m"): defaultdict(lambda: [ZERO, 0])
        for back in range(months - 1, -1, -1)
    }
    weekday_total = [ZERO] * 7
    weekday_count = [0] * 7
    items: dict[str, dict] = {}

    for e in rows:
        daily[e.date] += e.amount
        bucket = monthly[e.date.strftime("%Y-%m")][e.category_id]
        bucket[0] += e.amount
        bucket[1] += 1
        weekday_total[e.date.weekday()] += e.amount
        weekday_count[e.date.weekday()] += 1

        key = " ".join(e.title.lower().split())
        item = items.setdefault(
            key, {"title": e.title, "count": 0, "total": ZERO, "categories": Counter()}
        )
        item["count"] += 1
        item["total"] += e.amount
        item["categories"][e.category_id] += 1
        item["title"] = e.title  # rows are date-ordered, so this keeps the latest spelling

    # How many Mondays, Tuesdays, ... the range contains, for fair averages.
    occurrences = [0] * 7
    for offset in range(days):
        occurrences[(start + timedelta(days=offset)).weekday()] += 1

    amounts = [e.amount for e in rows]
    total = sum(amounts, ZERO)
    frequent = sorted(
        (i for i in items.values() if i["count"] >= 2),
        key=lambda i: (i["count"], i["total"]),
        reverse=True,
    )[:8]

    return TrendsOut(
        start=start,
        end=end,
        stats=TrendStats(
            total=total,
            count=len(rows),
            average_transaction=total / len(rows) if rows else ZERO,
            median_transaction=statistics.median(amounts) if amounts else ZERO,
            days=days,
            spending_days=len(daily),
            average_per_month=total / months,
        ),
        monthly=[
            MonthBucket(
                month=month,
                total=sum((v[0] for v in cats.values()), ZERO),
                by_category=[
                    CategoryTotal(category_id=c, amount=v[0], count=v[1])
                    for c, v in sorted(cats.items(), key=lambda kv: kv[1][0], reverse=True)
                ],
            )
            for month, cats in monthly.items()
        ],
        weekdays=[
            WeekdayStat(
                weekday=d,
                total=weekday_total[d],
                count=weekday_count[d],
                occurrences=occurrences[d],
                average=weekday_total[d] / occurrences[d] if occurrences[d] else ZERO,
            )
            for d in range(7)
        ],
        daily=[DailyPoint(date=d, amount=a) for d, a in sorted(daily.items())],
        frequent=[
            FrequentItem(
                title=i["title"],
                count=i["count"],
                total=i["total"],
                average=i["total"] / i["count"],
                category_id=i["categories"].most_common(1)[0][0],
            )
            for i in frequent
        ],
        largest=[
            ExpenseOut.model_validate(e)
            for e in sorted(rows, key=lambda e: e.amount, reverse=True)[:5]
        ],
    )
