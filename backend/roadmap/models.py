from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Roadmap(Base):
    __tablename__ = "roadmaps"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    skill_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    overview_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    career_impact: Mapped[str | None] = mapped_column(Text, nullable=True)
    syllabus_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty_band: Mapped[str] = mapped_column(String(20), default="beginner")
    total_score: Mapped[int] = mapped_column(Integer, default=100)
    units: Mapped[list[Unit]] = relationship(
        "Unit", back_populates="roadmap", order_by="Unit.order_index"
    )

class Unit(Base):
    __tablename__ = "units"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    roadmap_id: Mapped[str | None] = mapped_column(ForeignKey("roadmaps.id"))
    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    order_index: Mapped[int | None] = mapped_column(Integer, nullable=True)
    unit_score: Mapped[int] = mapped_column(Integer, default=10)
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)
    roadmap: Mapped[Roadmap] = relationship("Roadmap", back_populates="units")
    subpoints: Mapped[list[SubPoint]] = relationship(
        "SubPoint", back_populates="unit", order_by="SubPoint.order_index"
    )

class SubPoint(Base):
    __tablename__ = "subpoints"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    unit_id: Mapped[str | None] = mapped_column(ForeignKey("units.id"))
    title: Mapped[str | None] = mapped_column(String(300), nullable=True)
    order_index: Mapped[int | None] = mapped_column(Integer, nullable=True)
    practice_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    learning_resource_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    assessment_type: Mapped[str] = mapped_column(String(20), default="none")
    unit: Mapped[Unit] = relationship("Unit", back_populates="subpoints")

class UserProgress(Base):
    __tablename__ = "user_progress"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, nullable=False)
    subpoint_id: Mapped[str | None] = mapped_column(ForeignKey("subpoints.id"))
    status: Mapped[str] = mapped_column(String(20), default="not_started")
    score_earned: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)