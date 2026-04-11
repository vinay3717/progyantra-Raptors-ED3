from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    model_config = ConfigDict(extra="forbid")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    model_config = ConfigDict(extra="forbid")


class OnboardingUpdateRequest(BaseModel):
    selected_skill: str | None = None
    test_score: int | None = None
    level: str | None = None
    onboarding_complete: bool = True

    model_config = ConfigDict(extra="forbid")


class AuthResponse(BaseModel):
    token: str
    user_id: str
    onboarding_complete: bool
    message: str | None = None

    model_config = ConfigDict(extra="forbid")


class UserProfileResponse(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    selected_skill: str | None = None
    test_score: int | None = None
    level: str | None = None
    onboarding_complete: bool

    model_config = ConfigDict(extra="forbid")
