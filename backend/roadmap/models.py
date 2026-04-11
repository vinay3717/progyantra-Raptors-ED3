from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    skill_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    overview_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    career_impact: Mapped[str | None] = mapped_column(Text, nullable=True)
    syllabus_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    program_outcomes: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty_band: Mapped[str] = mapped_column(String(20), default="beginner", nullable=False)
    total_score: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    units: Mapped[list["Unit"]] = relationship(
        "Unit",
        back_populates="roadmap",
        order_by="Unit.order_index",
        cascade="all, delete-orphan",
    )


class Unit(Base):
    __tablename__ = "units"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    roadmap_id: Mapped[str] = mapped_column(ForeignKey("roadmaps.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_score: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    roadmap: Mapped["Roadmap"] = relationship("Roadmap", back_populates="units")
    subpoints: Mapped[list["SubPoint"]] = relationship(
        "SubPoint",
        back_populates="unit",
        order_by="SubPoint.order_index",
        cascade="all, delete-orphan",
    )


class SubPoint(Base):
    __tablename__ = "subpoints"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    unit_id: Mapped[str] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    practice_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    learning_resource_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    assessment_type: Mapped[str] = mapped_column(String(20), default="none", nullable=False)
    points_value: Mapped[int] = mapped_column(Integer, default=10, nullable=False)

    unit: Mapped["Unit"] = relationship("Unit", back_populates="subpoints")


class UserProgress(Base):
    __tablename__ = "user_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "subpoint_id", name="uq_user_progress_user_subpoint"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    subpoint_id: Mapped[str] = mapped_column(ForeignKey("subpoints.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(String(20), default="not_started", nullable=False)
    score_earned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
