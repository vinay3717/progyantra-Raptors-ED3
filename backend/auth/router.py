from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import service
from auth.models import User
from auth.schemas import (
    AuthResponse,
    LoginRequest,
    OnboardingUpdateRequest,
    RegisterRequest,
    UserProfileResponse,
)
from core.database import get_db
from core.security import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = service.register_user(db, payload)
    data = service.build_auth_response(user, message="Registration successful")
    return AuthResponse(**data)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = service.authenticate_user(db, payload)
    data = service.build_auth_response(user, message="Login successful")
    return AuthResponse(**data)


@router.patch("/onboarding", response_model=AuthResponse)
def update_onboarding(
    payload: OnboardingUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AuthResponse:
    user = service.update_onboarding_state(db, current_user["user_id"], payload)
    data = service.build_auth_response(user, message="Onboarding profile updated")
    return AuthResponse(**data)


@router.get("/me", response_model=UserProfileResponse)
def get_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        # Keep payload-safe fallback if token is from a legacy source.
        return UserProfileResponse(
            user_id=current_user["user_id"],
            name=current_user.get("name", "Learner"),
            email=current_user.get("email", "unknown@example.com"),
            selected_skill=current_user.get("selected_skill"),
            test_score=current_user.get("test_score"),
            level=current_user.get("level"),
            onboarding_complete=bool(current_user.get("onboarding_complete", False)),
        )

    return UserProfileResponse(
        user_id=user.id,
        name=user.name,
        email=user.email,
        selected_skill=user.selected_skill,
        test_score=user.test_score,
        level=user.level,
        onboarding_complete=user.onboarding_complete,
    )
