from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class PreviousAnswer(BaseModel):
    question_id: int
    dimension: str
    answer: str

    model_config = ConfigDict(extra="forbid")


class QuestionRequest(BaseModel):
    target_skill: Optional[str] = None
    previous_answers: List[PreviousAnswer] = Field(default_factory=list)

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


class NextQuestionResponse(BaseModel):
    system_prompt: str
    user_message: str
    assistant_message: str
    parsed_question: Optional[dict[str, Any]] = None
    raw_response: dict[str, Any]

    model_config = ConfigDict(extra="forbid")
