from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from roadmap import schemas, service
from roadmap.dependencies import get_current_user

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])


@router.get("/{skill}", response_model=schemas.RoadmapOut)
def get_roadmap(
    skill: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> schemas.RoadmapOut:
    data = service.get_roadmap(db, skill, user["user_id"])
    if not data:
        raise HTTPException(status_code=404, detail="Roadmap not found for this skill")
    return data


@router.post("/progress", response_model=schemas.ProgressResponse)
def update_progress(
    body: schemas.ProgressUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> schemas.ProgressResponse:
    from roadmap.models import SubPoint, Unit

    subpoint = db.query(SubPoint).filter_by(id=body.subpoint_id).first()
    if not subpoint:
        raise HTTPException(status_code=404, detail="Subpoint not found")

    unit = db.query(Unit).filter_by(id=subpoint.unit_id).first()
    if not unit or not unit.roadmap_id:
        raise HTTPException(status_code=404, detail="Roadmap unit not found")

    score_to_store = body.score_earned or subpoint.points_value
    service.mark_complete(db, user["user_id"], body.subpoint_id, score_to_store)
    total = service.get_user_score(db, user["user_id"], str(unit.roadmap_id))
    return schemas.ProgressResponse(success=True, new_total_score=total)


@router.post("/generate", response_model=schemas.GenerateRoadmapResponse)
def generate_roadmap(
    body: schemas.GenerateRoadmapRequest,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
) -> schemas.GenerateRoadmapResponse:
    roadmap = service.generate_and_store_roadmap(db, body.skill, body.difficulty_band)
    return schemas.GenerateRoadmapResponse(
        success=True,
        message="Roadmap generated and stored",
        skill=roadmap.skill_name,
    )
