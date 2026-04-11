from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class PreviousAnswer(BaseModel):
    question_id: int = Field(ge=1)
    skill_area: str = Field(min_length=1, max_length=80)
    question_text: str = Field(min_length=1, max_length=500)
    answer: str = Field(min_length=1, max_length=1000)

    model_config = ConfigDict(extra="forbid")


class SkillTestRequest(BaseModel):
    selected_skill: str = Field(min_length=1, max_length=120)
    personality_scores: Optional[dict[str, Any]] = None
    previous_answers: List[PreviousAnswer] = Field(default_factory=list, max_length=30)
    max_questions: int = Field(default=15, ge=1, le=30)

    model_config = ConfigDict(extra="forbid")


class PromptMessage(BaseModel):
    role: str
    content: str

    model_config = ConfigDict(extra="forbid")


class PromptResponse(BaseModel):
    system_prompt: str
    user_message: str
    messages: List[PromptMessage]

    model_config = ConfigDict(extra="forbid")


class SkillTestResponse(BaseModel):
    system_prompt: str
    user_message: str
    assistant_message: str
    parsed_payload: Optional[dict[str, Any]] = None
    raw_response: dict[str, Any]

    model_config = ConfigDict(extra="forbid")
