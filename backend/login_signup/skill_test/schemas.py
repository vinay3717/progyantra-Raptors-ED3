from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

QuestionType = Literal["mcq", "coding", "scenario", "short_answer"]
DifficultyBand = Literal["beginner", "intermediate", "advanced"]
ResponseStatus = Literal["next_question", "test_complete"]


class PreviousAnswer(BaseModel):
    question_id: int = Field(ge=1)
    skill_area: str = Field(min_length=1, max_length=120)
    question_text: str = Field(min_length=1, max_length=800)
    question_type: QuestionType = "mcq"
    answer: str = Field(min_length=1, max_length=5000)

    model_config = ConfigDict(extra="forbid")


class BeginnerQuestion(BaseModel):
    question_id: int = Field(ge=1)
    skill_area: str = Field(min_length=1, max_length=120)
    question_text: str = Field(min_length=1, max_length=1200)
    type: QuestionType = "mcq"
    options: list[str] = Field(default_factory=list, max_length=4)
    difficulty: DifficultyBand = "beginner"
    explanation_for_adaptation: str | None = None

    model_config = ConfigDict(extra="ignore")


class BeginnerProgress(BaseModel):
    asked: int = Field(ge=0, le=50)
    min_questions: int = Field(ge=1, le=50)
    max_questions: int = Field(ge=1, le=50)

    model_config = ConfigDict(extra="ignore")


class BeginnerTestStartRequest(BaseModel):
    selected_skill: str = Field(min_length=1, max_length=120)
    personality_scores: dict[str, Any] | None = None
    min_questions: int = Field(default=12, ge=12, le=20)
    max_questions: int = Field(default=20, ge=12, le=20)

    model_config = ConfigDict(extra="forbid")


class BeginnerTestAnswerRequest(BaseModel):
    session_id: str = Field(min_length=8, max_length=120)
    answer: str = Field(min_length=1, max_length=5000)

    model_config = ConfigDict(extra="forbid")


class BeginnerTestStepResponse(BaseModel):
    session_id: str
    status: ResponseStatus
    selected_skill: str
    question: BeginnerQuestion | None = None
    progress: BeginnerProgress | None = None
    final_score: int | None = None
    assigned_level: DifficultyBand | None = None
    personality_scores: dict[str, Any] | None = None
    roadmap_readiness_json: dict[str, Any] | None = None
    raw_response: dict[str, Any] | None = None

    model_config = ConfigDict(extra="ignore")


class PromptMessage(BaseModel):
    role: str
    content: str

    model_config = ConfigDict(extra="forbid")
