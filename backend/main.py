from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.router import router as auth_router
from core.config import settings
from core.database import Base, SessionLocal, engine
from core.seed import seed_sample_data
from login_signup.personality_test.router import router as personality_test_router
from roadmap.router import router as roadmap_router

# Ensure model metadata is imported before create_all.
from auth import models as auth_models  # noqa: F401
from roadmap import models as roadmap_models  # noqa: F401

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(roadmap_router)
app.include_router(personality_test_router, prefix="/api")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("startup")
def startup_event() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_sample_data(db)
    finally:
        db.close()
