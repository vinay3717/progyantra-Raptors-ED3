from fastapi import APIRouter, HTTPException, status

from .schemas import PromptResponse, SkillTestRequest, SkillTestResponse
from .service import build_messages, call_llm, parse_assistant_message

router = APIRouter(prefix="/skill-test", tags=["skill-test"])


@router.post("/prompt", response_model=PromptResponse)
def get_prompt(request: SkillTestRequest) -> PromptResponse:
    system_prompt, user_message, messages = build_messages(
        request.selected_skill,
        request.personality_scores,
        request.previous_answers,
        request.max_questions,
    )
    return PromptResponse(
        system_prompt=system_prompt,
        user_message=user_message,
        messages=messages,
    )


@router.post("/next-question", response_model=SkillTestResponse)
def next_question(request: SkillTestRequest) -> SkillTestResponse:
    system_prompt, user_message, messages = build_messages(
        request.selected_skill,
        request.personality_scores,
        request.previous_answers,
        request.max_questions,
    )
    try:
        raw_response, assistant_message = call_llm(messages)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "LLM is not configured. Set LLM_API_URL, LLM_API_KEY, and "
                "LLM_MODEL or use /skill-test/prompt."
            ),
        )

    parsed_payload = parse_assistant_message(assistant_message)
    return SkillTestResponse(
        system_prompt=system_prompt,
        user_message=user_message,
        assistant_message=assistant_message,
        parsed_payload=parsed_payload,
        raw_response=raw_response,
    )
