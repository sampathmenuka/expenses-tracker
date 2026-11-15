from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import delete, func, select

from app.defaults import seed_default_categories
from app.deps import CurrentUser, DbSession
from app.models import Expense, User
from app.rate_limit import client_ip, login_failures, login_failures_by_ip, registrations
from app.schemas import (
    LoginIn,
    PasswordChange,
    PasswordConfirm,
    RegisterIn,
    TokenOut,
    UserOut,
    UserUpdate,
)
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _token_for(user: User) -> TokenOut:
    return TokenOut(
        access_token=create_access_token(user.id, user.token_version),
        user=UserOut.model_validate(user),
    )


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, request: Request, db: DbSession) -> TokenOut:
    ip = client_ip(request)
    registrations.check(ip)
    registrations.hit(ip)

    email = payload.email.lower()
    exists = db.scalar(select(User.id).where(func.lower(User.email) == email))
    if exists:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")

    user = User(name=payload.name, email=email, password_hash=hash_password(payload.password))
    db.add(user)
    seed_default_categories(db, user)
    db.commit()
    return _token_for(user)


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, request: Request, db: DbSession) -> TokenOut:
    email = payload.email.lower()
    ip = client_ip(request)
    account_key = f"{ip}|{email}"
    login_failures.check(account_key)
    login_failures_by_ip.check(ip)

    user = db.scalar(select(User).where(func.lower(User.email) == email))
    # Always run bcrypt, so an unknown email takes as long as a wrong password.
    if not verify_password(payload.password, user.password_hash if user else None):
        login_failures.hit(account_key)
        login_failures_by_ip.hit(ip)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email or password is incorrect.")

    login_failures.reset(account_key)
    return _token_for(user)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser) -> User:
    return user


@router.patch("/me", response_model=UserOut)
def update_me(payload: UserUpdate, user: CurrentUser, db: DbSession) -> User:
    for field, value in payload.model_dump(exclude_unset=True).items():
        if field in ("name", "currency") and value is None:
            continue
        setattr(user, field, value)
    db.commit()
    return user


@router.post("/password", response_model=TokenOut)
def change_password(payload: PasswordChange, user: CurrentUser, db: DbSession) -> TokenOut:
    """Changes the password and signs out every other session; returns a fresh token."""
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect.")
    user.password_hash = hash_password(payload.new_password)
    user.token_version += 1
    db.commit()
    return _token_for(user)


@router.post("/sessions/revoke", response_model=TokenOut)
def revoke_sessions(user: CurrentUser, db: DbSession) -> TokenOut:
    """Signs out every device. The caller gets a new token so this session continues."""
    user.token_version += 1
    db.commit()
    return _token_for(user)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(payload: PasswordConfirm, user: CurrentUser, db: DbSession) -> None:
    """Permanently deletes the account and all of its categories and expenses."""
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Password is incorrect.")
    # Expenses first: categories can't be removed while expenses still point at them.
    db.execute(delete(Expense).where(Expense.user_id == user.id))
    db.delete(user)
    db.commit()
