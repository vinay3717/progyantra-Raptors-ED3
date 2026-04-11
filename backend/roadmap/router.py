from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from roadmap.dependencies import get_current_user
from roadmap import service, schemas

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

@router.get("/{skill}", response_model=schemas.RoadmapOut)
def get_roadmap(skill: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    data = service.get_roadmap(db, skill, user["user_id"])
    if not data:
        raise HTTPException(status_code=404, detail="Roadmap not found for this skill")
    return data

@router.post("/progress", response_model=schemas.ProgressResponse)
def update_progress(body: schemas.ProgressUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    from roadmap.models import SubPoint, Unit
    sp = db.query(SubPoint).filter_by(id=body.subpoint_id).first()
    if not sp:
        raise HTTPException(status_code=404, detail="Subpoint not found")
    unit = db.query(Unit).filter_by(id=sp.unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found for subpoint")
    if not unit.roadmap_id:
        raise HTTPException(status_code=404, detail="Roadmap not found for subpoint")
    service.mark_complete(db, user["user_id"], body.subpoint_id, body.score_earned)
    total = service.get_user_score(db, user["user_id"], str(unit.roadmap_id))
    return schemas.ProgressResponse(success=True, new_total_score=total)