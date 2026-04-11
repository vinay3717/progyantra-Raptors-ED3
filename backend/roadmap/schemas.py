from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

DifficultyBand = Literal["beginner", "intermediate", "advanced"]
GraphNodeType = Literal["start", "topic", "assessment", "end"]
GraphNodeStatus = Literal["locked", "active", "completed"]
AssessmentType = Literal["quiz", "task", "project", "none", "coding"]


class SubPointOut(BaseModel):
    id: str
    title: str
    status: str = "not_started"
    points_value: int = 10
    practice_url: str | None = None
    learning_resource_url: str | None = None
    assessment_type: AssessmentType = "none"

    model_config = ConfigDict(from_attributes=True)


class UnitOut(BaseModel):
    id: str
    title: str
    order_index: int
    unit_score: int
    is_locked: bool
    user_unit_progress: str
    subpoints: list[SubPointOut]

    model_config = ConfigDict(from_attributes=True)


class OverviewOut(BaseModel):
    description: str
    career_impact: str
    syllabus_summary: list[str]
    program_outcomes: list[str] = Field(default_factory=list)


class GraphNodeOut(BaseModel):
    id: str
    label: str
    x: int
    y: int
    type: GraphNodeType
    status: GraphNodeStatus


class GraphEdgeOut(BaseModel):
    from_: str = Field(alias="from")
    to: str

    model_config = ConfigDict(populate_by_name=True)


class GraphOut(BaseModel):
    nodes: list[GraphNodeOut]
    edges: list[GraphEdgeOut]


class RoadmapOut(BaseModel):
    skill: str
    difficulty_band: DifficultyBand = "beginner"
    overview: OverviewOut
    units: list[UnitOut]
    total_score: int
    user_score: int
    score_tier: str
    graph: GraphOut


class ProgressUpdate(BaseModel):
    subpoint_id: str
    score_earned: int = 0


class ProgressResponse(BaseModel):
    success: bool
    new_total_score: int


class GenerateRoadmapRequest(BaseModel):
    skill: str
    difficulty_band: DifficultyBand = "beginner"


class GenerateRoadmapResponse(BaseModel):
    success: bool
    message: str
    skill: str
