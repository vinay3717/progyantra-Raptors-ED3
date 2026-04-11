from __future__ import annotations

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from auth.models import User
from auth.schemas import LoginRequest, OnboardingUpdateRequest, RegisterRequest
from core.security import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.strip().lower()).first()


def register_user(db: Session, payload: RegisterRequest) -> User:
    email = payload.email.strip().lower()
    existing = get_user_by_email(db, email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    user = User(
        name=payload.name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, payload: LoginRequest) -> User:
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    return user


def build_auth_response(user: User, message: str | None = None) -> dict[str, str | bool | None]:
    token = create_access_token(
        user_id=user.id,
        email=user.email,
        onboarding_complete=user.onboarding_complete,
        selected_skill=user.selected_skill,
        test_score=user.test_score,
        level=user.level,
    )
    return {
        "token": token,
        "user_id": user.id,
        "onboarding_complete": user.onboarding_complete,
        "message": message,
    }


def update_onboarding_state(db: Session, user_id: str, payload: OnboardingUpdateRequest) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.selected_skill is not None:
        user.selected_skill = payload.selected_skill.strip().lower()
    if payload.test_score is not None:
        user.test_score = int(payload.test_score)
    if payload.level is not None:
        user.level = payload.level.strip().lower()

    user.onboarding_complete = payload.onboarding_complete
    db.commit()
    db.refresh(user)
    return user
