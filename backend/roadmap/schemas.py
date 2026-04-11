from pydantic import BaseModel
from typing import List, Optional

class SubPointOut(BaseModel):
    id: str
    title: str
    status: str = "not_started"
    score_earned: int = 0
    practice_url: Optional[str]
    learning_resource_url: Optional[str]
    assessment_type: str

    class Config:
        from_attributes = True

class UnitOut(BaseModel):
    id: str
    title: str
    order_index: int
    unit_score: int
    is_locked: bool
    subpoints: List[SubPointOut]

    class Config:
        from_attributes = True

class OverviewOut(BaseModel):
    description: str
    career_impact: str
    syllabus_summary: List[str]

class RoadmapOut(BaseModel):
    skill: str
    difficulty_band: str
    overview: OverviewOut
    units: List[UnitOut]
    total_score: int
    user_score: int

class ProgressUpdate(BaseModel):
    subpoint_id: str
    score_earned: int = 0

class ProgressResponse(BaseModel):
    success: bool
    new_total_score: int