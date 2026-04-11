from __future__ import annotations

import json
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from roadmap.generation import generate_roadmap_payload
from roadmap.models import Roadmap, SubPoint, Unit, UserProgress
from roadmap.schemas import GraphEdgeOut, GraphNodeOut, OverviewOut, RoadmapOut, SubPointOut, UnitOut


def normalize_skill(skill: str) -> str:
    return skill.strip().lower().replace(" ", "-")


def score_tier(score: int) -> str:
    if score >= 90:
        return "S+"
    if score >= 50:
        return "10+"
    return "52+"


def _safe_json_loads(raw: str | None, fallback: list[str]) -> list[str]:
    if not raw:
        return fallback
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(item) for item in parsed]
    except json.JSONDecodeError:
        pass
    return fallback


def get_user_score(db: Session, user_id: str, roadmap_id: str) -> int:
    units = db.query(Unit).filter(Unit.roadmap_id == roadmap_id).all()
    subpoint_ids = [sp.id for unit in units for sp in unit.subpoints]
    if not subpoint_ids:
        return 0

    progress_rows = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == user_id,
            UserProgress.subpoint_id.in_(subpoint_ids),
            UserProgress.status == "completed",
        )
        .all()
    )
    return sum(int(row.score_earned) for row in progress_rows)


def get_subpoint_status(db: Session, user_id: str, subpoint_id: str) -> tuple[str, int]:
    progress = db.query(UserProgress).filter_by(user_id=user_id, subpoint_id=subpoint_id).first()
    if not progress:
        return "not_started", 0
    return str(progress.status), int(progress.score_earned)


def _unit_progress_label(subpoints: list[SubPointOut]) -> str:
    completed = len([subpoint for subpoint in subpoints if subpoint.status == "completed"])
    return f"{completed}/{len(subpoints)} subpoints complete"


def _node_status(unit: UnitOut) -> str:
    completed = len([subpoint for subpoint in unit.subpoints if subpoint.status == "completed"])
    if completed == len(unit.subpoints):
        return "completed"
    if completed > 0 or not unit.is_locked:
        return "active"
    return "locked"


def _build_graph(units: list[UnitOut]) -> tuple[list[GraphNodeOut], list[GraphEdgeOut]]:
    nodes: list[GraphNodeOut] = []
    edges: list[GraphEdgeOut] = []

    x_base = 100
    x_step = 200
    y_values = [170, 90, 170, 90, 170, 90]

    for idx, unit in enumerate(units):
        node_type = "topic"
        if idx == 0:
            node_type = "start"
        elif idx == len(units) - 1:
            node_type = "assessment"

        nodes.append(
            GraphNodeOut(
                id=unit.id,
                label=unit.title,
                x=x_base + (idx * x_step),
                y=y_values[idx % len(y_values)],
                type=node_type,  # type: ignore[arg-type]
                status=_node_status(unit),  # type: ignore[arg-type]
            )
        )

        if idx > 0:
            edges.append(GraphEdgeOut(from_=units[idx - 1].id, to=unit.id))

    return nodes, edges


def create_roadmap_from_payload(db: Session, payload: dict[str, Any]) -> Roadmap:
    skill = normalize_skill(str(payload.get("skill", "general-skill")))
    existing = db.query(Roadmap).filter(Roadmap.skill_name == skill).first()
    if existing:
        return existing

    overview = payload.get("overview") if isinstance(payload.get("overview"), dict) else {}
    units_payload = payload.get("units") if isinstance(payload.get("units"), list) else []

    roadmap = Roadmap(
        skill_name=skill,
        overview_text=str(overview.get("description") or ""),
        career_impact=str(overview.get("career_impact") or ""),
        syllabus_summary=json.dumps(overview.get("syllabus_summary") or []),
        program_outcomes=json.dumps(overview.get("program_outcomes") or []),
        difficulty_band=str(payload.get("difficulty_band") or "beginner"),
        total_score=100,
    )

    for unit_idx, unit_payload in enumerate(units_payload, start=1):
        if not isinstance(unit_payload, dict):
            continue

        unit = Unit(
            title=str(unit_payload.get("title") or f"Unit {unit_idx}"),
            order_index=unit_idx,
            unit_score=int(unit_payload.get("unit_score") or 10),
            is_locked=unit_idx > 1,
        )

        subpoints_payload = (
            unit_payload.get("subpoints") if isinstance(unit_payload.get("subpoints"), list) else []
        )

        for sub_idx, subpoint_payload in enumerate(subpoints_payload, start=1):
            if not isinstance(subpoint_payload, dict):
                continue
            unit.subpoints.append(
                SubPoint(
                    title=str(subpoint_payload.get("title") or f"Subpoint {sub_idx}"),
                    order_index=sub_idx,
                    practice_url=subpoint_payload.get("practice_url"),
                    learning_resource_url=subpoint_payload.get("learning_resource_url"),
                    assessment_type=str(subpoint_payload.get("assessment_type") or "none"),
                    points_value=int(subpoint_payload.get("points_value") or 10),
                )
            )

        roadmap.units.append(unit)

    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)
    return roadmap


def generate_and_store_roadmap(db: Session, skill: str, difficulty_band: str = "beginner") -> Roadmap:
    payload = generate_roadmap_payload(normalize_skill(skill), difficulty_band)
    return create_roadmap_from_payload(db, payload)


def get_roadmap(db: Session, skill: str, user_id: str) -> RoadmapOut | None:
    skill_slug = normalize_skill(skill)
    roadmap = db.query(Roadmap).filter(Roadmap.skill_name == skill_slug).first()
    if not roadmap:
        roadmap = generate_and_store_roadmap(db, skill_slug, "beginner")

    if not roadmap:
        return None

    units_out: list[UnitOut] = []
    for unit in roadmap.units:
        subpoints_out: list[SubPointOut] = []
        for subpoint in unit.subpoints:
            status, earned = get_subpoint_status(db, user_id, subpoint.id)
            subpoints_out.append(
                SubPointOut(
                    id=subpoint.id,
                    title=subpoint.title,
                    status=status,
                    points_value=earned if status == "completed" else subpoint.points_value,
                    practice_url=subpoint.practice_url,
                    learning_resource_url=subpoint.learning_resource_url,
                    assessment_type=subpoint.assessment_type,
                )
            )

        unit_out = UnitOut(
            id=unit.id,
            title=unit.title,
            order_index=unit.order_index,
            unit_score=unit.unit_score,
            is_locked=unit.is_locked,
            user_unit_progress=_unit_progress_label(subpoints_out),
            subpoints=subpoints_out,
        )
        units_out.append(unit_out)

    user_score = get_user_score(db, user_id, roadmap.id)
    nodes, edges = _build_graph(units_out)

    return RoadmapOut(
        skill=roadmap.skill_name,
        difficulty_band=roadmap.difficulty_band,  # type: ignore[arg-type]
        overview=OverviewOut(
            description=roadmap.overview_text or "",
            career_impact=roadmap.career_impact or "",
            syllabus_summary=_safe_json_loads(roadmap.syllabus_summary, []),
            program_outcomes=_safe_json_loads(roadmap.program_outcomes, []),
        ),
        units=units_out,
        total_score=int(roadmap.total_score),
        user_score=user_score,
        score_tier=score_tier(user_score),
        graph={"nodes": nodes, "edges": edges},
    )


def mark_complete(db: Session, user_id: str, subpoint_id: str, score: int) -> None:
    progress = db.query(UserProgress).filter_by(user_id=user_id, subpoint_id=subpoint_id).first()
    if not progress:
        progress = UserProgress(user_id=user_id, subpoint_id=subpoint_id)
        db.add(progress)

    progress.status = "completed"
    progress.score_earned = int(score)
    progress.completed_at = datetime.utcnow()
    db.commit()
