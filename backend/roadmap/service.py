from __future__ import annotations

import json
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session
from roadmap.models import Roadmap, Unit, SubPoint, UserProgress
from roadmap.schemas import RoadmapOut, OverviewOut, UnitOut, SubPointOut

def get_user_score(db: Session, user_id: str, roadmap_id: str) -> int:
    units = db.query(Unit).filter(Unit.roadmap_id == roadmap_id).all()
    subpoint_ids = [sp.id for u in units for sp in u.subpoints]
    if not subpoint_ids:
        return 0
    total = db.query(UserProgress).filter(
        UserProgress.user_id == user_id,
        UserProgress.subpoint_id.in_(subpoint_ids),
        UserProgress.status == "completed"
    ).all()
    return sum(int(p.score_earned) for p in total)

def get_subpoint_status(db: Session, user_id: str, subpoint_id: str) -> tuple[str, int]:
    p = db.query(UserProgress).filter_by(user_id=user_id, subpoint_id=subpoint_id).first()
    if not p:
        return "not_started", 0
    return str(p.status), int(p.score_earned)

def get_roadmap(db: Session, skill: str, user_id: str) -> RoadmapOut | None:
    roadmap = db.query(Roadmap).filter(Roadmap.skill_name == skill).first()
    if not roadmap:
        return None

    units_out = []
    for unit in roadmap.units:
        sps_out = []
        for sp in unit.subpoints:
            status, score = get_subpoint_status(db, user_id, sp.id)
            subpoint_title = sp.title or ""
            practice_url = sp.practice_url
            learning_resource_url = sp.learning_resource_url
            assessment_type = sp.assessment_type or "none"
            sps_out.append(SubPointOut(
                id=sp.id,
                title=subpoint_title,
                status=status,
                score_earned=score,
                practice_url=practice_url,
                learning_resource_url=learning_resource_url,
                assessment_type=assessment_type
            ))
        unit_title = unit.title or ""
        unit_order_index = unit.order_index or 0
        units_out.append(UnitOut(
            id=unit.id,
            title=unit_title,
            order_index=unit_order_index,
            unit_score=int(unit.unit_score),
            is_locked=bool(unit.is_locked),
            subpoints=sps_out
        ))

    syllabus = json.loads(roadmap.syllabus_summary) if roadmap.syllabus_summary else []
    roadmap_title = roadmap.skill_name or skill
    difficulty_band = roadmap.difficulty_band or "beginner"
    description = roadmap.overview_text or ""
    career_impact = roadmap.career_impact or ""
    total_score = int(roadmap.total_score)
    user_score = get_user_score(db, user_id, roadmap.id)

    return RoadmapOut(
        skill=roadmap_title,
        difficulty_band=difficulty_band,
        overview=OverviewOut(
            description=description,
            career_impact=career_impact,
            syllabus_summary=syllabus
        ),
        units=units_out,
        total_score=total_score,
        user_score=user_score
    )

def mark_complete(db: Session, user_id: str, subpoint_id: str, score: int):
    p = db.query(UserProgress).filter_by(user_id=user_id, subpoint_id=subpoint_id).first()
    if not p:
        p = UserProgress(user_id=user_id, subpoint_id=subpoint_id)
        db.add(p)
    p.status = "completed"
    p.score_earned = score
    p.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(p)