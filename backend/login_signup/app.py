import os
from datetime import datetime, timedelta
from typing import Generator

from fastapi import Depends, FastAPI, HTTPException, status
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict, model_validator
from sqlalchemy import DateTime, Integer, String, create_engine, or_, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from login_signup.personality_test.router import router as personality_test_router

# Simple config with safe defaults. Use env vars in production.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./login_signup.db")
SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS", "7"))

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# Password hashing helper (bcrypt).
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    username: str
    password: str
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("passwords do not match")
        return self


class LoginRequest(BaseModel):
    email_or_phone: str
    password: str


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


app = FastAPI(title="Login/Signup API")
app.include_router(personality_test_router)


def get_db() -> Generator[Session, None, None]:
    # Provide one DB session per request.
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(user_id: int) -> str:
    # Create a short-lived JWT for simple session handling.
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@app.on_event("startup")
def on_startup() -> None:
    # Create tables on first run so setup is easy.
    Base.metadata.create_all(bind=engine)


@app.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_db)) -> UserResponse:
    # Normalize input so duplicates are handled consistently.
    email = request.email.strip().lower()
    phone = request.phone.strip()
    username = request.username.strip()

    # Check for existing user by email, phone, or username.
    stmt = select(User).where(
        or_(
            User.email == email,
            User.phone == phone,
            User.username == username,
        )
    )
    existing = db.execute(stmt).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email, phone, or username already exists",
        )

    user = User(
        first_name=request.first_name.strip(),
        last_name=request.last_name.strip(),
        email=email,
        phone=phone,
        username=username,
        password_hash=hash_password(request.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    # Allow login using either email or phone number.
    identifier = request.email_or_phone.strip()
    if "@" in identifier:
        identifier = identifier.lower()

    stmt = select(User).where(
        or_(User.email == identifier, User.phone == identifier)
    )
    user = db.execute(stmt).scalar_one_or_none()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, token_type="bearer")
