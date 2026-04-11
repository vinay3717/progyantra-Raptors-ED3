from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parents[1]

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./progyantra.db"
    JWT_SECRET: str = "super_secret_key_change_this"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value):
        if isinstance(value, str) and value.startswith("sqlite:///"):
            raw_path = value.replace("sqlite:///", "", 1)
            if raw_path.startswith("./"):
                raw_path = raw_path[2:]
            database_path = Path(raw_path)
            if not database_path.is_absolute():
                database_path = BASE_DIR / database_path
            return f"sqlite:///{database_path.as_posix()}"
        return value

    class Config:
        env_file = ".env"

settings = Settings()