from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from core.config import settings

bearer = HTTPBearer()


def create_access_token(
    *,
    user_id: str,
    email: str,
    onboarding_complete: bool = False,
    selected_skill: str | None = None,
    test_score: int | None = None,
    level: str | None = None,
) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    payload: dict[str, Any] = {
        "sub": user_id,
        "user_id": user_id,
        "email": email,
        "onboarding_complete": onboarding_complete,
        "selected_skill": selected_skill,
        "test_score": test_score,
        "level": level,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc

    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identity",
        )

    payload["user_id"] = str(user_id)
    return payload


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> dict[str, Any]:
    return decode_token(credentials.credentials)
