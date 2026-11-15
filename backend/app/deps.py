from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.security import decode_access_token

bearer = HTTPBearer(auto_error=False)

DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Please sign in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized
    claims = decode_access_token(credentials.credentials)
    if claims is None:
        raise unauthorized
    user_id, token_version = claims
    user = db.get(User, user_id)
    # A version mismatch means the token was revoked (password change, sign-out everywhere).
    if user is None or user.token_version != token_version:
        raise unauthorized
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
