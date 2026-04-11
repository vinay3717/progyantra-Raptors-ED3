from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "Progyantra API"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/progyantra"
    NEON_DATABASE_URL: str | None = None
    USE_NEON: bool = False

    JWT_SECRET: str = "super_secret_key_change_this"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7

    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_TEMPERATURE: float = 0.35
    GEMINI_TIMEOUT_SECS: float = 30.0

    FRONTEND_ORIGIN: str = "http://localhost:3000"

    @field_validator("DATABASE_URL", "NEON_DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str | None) -> str | None:
        if not isinstance(value, str):
            return value

        if value.startswith("postgres://"):
            value = value.replace("postgres://", "postgresql+psycopg://", 1)
        elif value.startswith("postgresql://"):
            value = value.replace("postgresql://", "postgresql+psycopg://", 1)

        if value.startswith("sqlite:///"):
            raw_path = value.replace("sqlite:///", "", 1)
            if raw_path.startswith("./"):
                raw_path = raw_path[2:]
            database_path = Path(raw_path)
            if not database_path.is_absolute():
                database_path = BASE_DIR / database_path
            return f"sqlite:///{database_path.as_posix()}"

        return value

    @property
    def database_url(self) -> str:
        if self.USE_NEON and self.NEON_DATABASE_URL:
            return self.NEON_DATABASE_URL
        return self.DATABASE_URL


settings = Settings()
