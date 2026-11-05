import datetime as dt
import uuid
from decimal import Decimal
from typing import Annotated, Literal

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    PlainSerializer,
    StringConstraints,
)
from pydantic.alias_generators import to_camel

# Money arrives as a decimal and leaves as a JSON number.
MoneyIn = Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2)]
MoneyOut = Annotated[Decimal, PlainSerializer(float, return_type=float)]
OptionalMoneyIn = Annotated[
    Decimal | None, Field(default=None, ge=0, max_digits=12, decimal_places=2)
]
HexColor = Annotated[str, StringConstraints(pattern=r"^#[0-9a-fA-F]{6}$")]
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]
Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
Note = Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000)]
# Keeps dates where calendar arithmetic is safe (no year 0 / year 10000 overflow).
MIN_DATE, MAX_DATE = dt.date(1900, 1, 1), dt.date(2199, 12, 31)


def _check_date(value: dt.date) -> dt.date:
    if not MIN_DATE <= value <= MAX_DATE:
        raise ValueError(f"date must be between {MIN_DATE} and {MAX_DATE}")
    return value


def _check_password_bytes(value: str) -> str:
    # bcrypt ignores everything after 72 bytes, so longer passwords would be silently weakened.
    if len(value.encode()) > 72:
        raise ValueError("password must be at most 72 bytes")
    return value


SafeDate = Annotated[dt.date, AfterValidator(_check_date)]
NewPassword = Annotated[
    str, StringConstraints(min_length=8, max_length=72), AfterValidator(_check_password_bytes)
]

IconKey = Literal[
    "food", "transport", "mobile", "education", "materials",
    "clothes", "donations", "other", "custom",
]


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel, populate_by_name=True, from_attributes=True
    )


# Auth / users


class RegisterIn(ApiModel):
    name: Name
    email: EmailStr
    password: NewPassword


class LoginIn(ApiModel):
    email: EmailStr
    password: Annotated[str, StringConstraints(max_length=200)]


class UserOut(ApiModel):
    id: uuid.UUID
    name: str
    email: str
    currency: str
    monthly_budget: MoneyOut | None


class TokenOut(ApiModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserUpdate(ApiModel):
    name: Name | None = None
    currency: Annotated[str, StringConstraints(pattern=r"^[A-Z]{3}$")] | None = None
    monthly_budget: OptionalMoneyIn = None


class PasswordChange(ApiModel):
    current_password: Annotated[str, StringConstraints(max_length=200)]
    new_password: NewPassword


class PasswordConfirm(ApiModel):
    password: Annotated[str, StringConstraints(max_length=200)]


# Categories


class CategoryIn(ApiModel):
    name: Name
    color: HexColor
    monthly_budget: OptionalMoneyIn = None


class CategoryUpdate(ApiModel):
    name: Name | None = None
    color: HexColor | None = None
    monthly_budget: OptionalMoneyIn = None


class CategoryOut(ApiModel):
    id: uuid.UUID
    name: str
    color: str
    icon: IconKey
    is_custom: bool
    is_fallback: bool
    monthly_budget: MoneyOut | None
    expense_count: int = 0


# Expenses


class ExpenseIn(ApiModel):
    title: Title
    amount: MoneyIn
    category_id: uuid.UUID
    date: SafeDate
    note: Note | None = None


class ExpenseUpdate(ApiModel):
    title: Title | None = None
    amount: MoneyIn | None = None
    category_id: uuid.UUID | None = None
    date: SafeDate | None = None
    note: Note | None = None


class ExpenseOut(ApiModel):
    id: uuid.UUID
    title: str
    amount: MoneyOut
    category_id: uuid.UUID
    date: dt.date
    note: str | None


class ExpensePage(ApiModel):
    items: list[ExpenseOut]
    total: int
    total_amount: MoneyOut


class ImportExpense(ApiModel):
    title: Title
    amount: MoneyIn
    category_name: Name
    category_color: HexColor | None = None
    date: SafeDate
    note: Note | None = None


class ImportIn(ApiModel):
    expenses: Annotated[list[ImportExpense], Field(max_length=10_000)]


class ImportOut(ApiModel):
    imported: int
    categories_created: int


# Reports


class DailyPoint(ApiModel):
    date: dt.date
    amount: MoneyOut


class CategoryTotal(ApiModel):
    category_id: uuid.UUID
    amount: MoneyOut
    count: int


class ReportOut(ApiModel):
    start: dt.date
    end: dt.date
    total: MoneyOut
    count: int
    previous_total: MoneyOut
    daily: list[DailyPoint]
    by_category: list[CategoryTotal]


class BudgetStatus(ApiModel):
    category_id: uuid.UUID
    budget: MoneyOut
    spent: MoneyOut


class DashboardOut(ApiModel):
    today_total: MoneyOut
    today_count: int
    week_total: MoneyOut
    week_count: int
    month_total: MoneyOut
    month_count: int
    monthly_budget: MoneyOut | None
    month_by_category: list[CategoryTotal]
    category_budgets: list[BudgetStatus]


# Analytics


class MonthCompare(ApiModel):
    category_id: uuid.UUID
    this_month: MoneyOut
    last_month: MoneyOut
    # Last month up to the same day number as today: the fair comparison mid-month.
    last_month_to_date: MoneyOut


class PacingOut(ApiModel):
    """This month against last month, for pacing and per-category change."""

    month_start: dt.date
    days_in_month: int
    days_elapsed: int
    this_month_daily: list[MoneyOut]
    last_month_daily: list[MoneyOut]
    this_month_total: MoneyOut
    last_month_total: MoneyOut
    last_month_same_point: MoneyOut
    monthly_budget: MoneyOut | None
    by_category: list[MonthCompare]


class MonthBucket(ApiModel):
    month: str
    total: MoneyOut
    by_category: list[CategoryTotal]


class WeekdayStat(ApiModel):
    weekday: int  # Monday = 0
    total: MoneyOut
    count: int
    occurrences: int  # how many of this weekday fall in the range
    average: MoneyOut


class FrequentItem(ApiModel):
    title: str
    count: int
    total: MoneyOut
    average: MoneyOut
    category_id: uuid.UUID


class TrendStats(ApiModel):
    total: MoneyOut
    count: int
    average_transaction: MoneyOut
    median_transaction: MoneyOut
    days: int
    spending_days: int
    average_per_month: MoneyOut


class TrendsOut(ApiModel):
    start: dt.date
    end: dt.date
    stats: TrendStats
    monthly: list[MonthBucket]
    weekdays: list[WeekdayStat]
    daily: list[DailyPoint]
    frequent: list[FrequentItem]
    largest: list[ExpenseOut]
