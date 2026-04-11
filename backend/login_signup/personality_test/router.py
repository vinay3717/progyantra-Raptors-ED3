from fastapi import APIRouter, HTTPException, status

from .schemas import NextQuestionResponse, PromptResponse, QuestionRequest
from .service import build_messages, call_llm, parse_assistant_message

router = APIRouter(prefix="/personality-test", tags=["personality-test"])


@router.post("/prompt", response_model=PromptResponse)
def get_prompt(request: QuestionRequest) -> PromptResponse:
    system_prompt, user_message, messages = build_messages(
        request.target_skill, request.previous_answers
    )
    return PromptResponse(
        system_prompt=system_prompt,
        user_message=user_message,
        messages=messages,
    )


@router.post("/next-question", response_model=NextQuestionResponse)
def next_question(request: QuestionRequest) -> NextQuestionResponse:
    system_prompt, user_message, messages = build_messages(
        request.target_skill, request.previous_answers
    )
    try:
        raw_response, assistant_message = call_llm(messages)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "LLM is not configured. Set GEMINI_API_KEY (preferred), or "
                "LLM_API_URL, LLM_API_KEY, and LLM_MODEL."
            ),
        )

    parsed_question = parse_assistant_message(assistant_message)
    return NextQuestionResponse(
        system_prompt=system_prompt,
        user_message=user_message,
        assistant_message=assistant_message,
        parsed_question=parsed_question,
        raw_response=raw_response,
    )
