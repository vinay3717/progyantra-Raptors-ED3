import httpx
from fastapi import APIRouter, HTTPException, status

from .schemas import NextQuestionResponse, PromptResponse, QuestionRequest
from .service import build_messages, call_llm, parse_assistant_message

router = APIRouter(prefix="/personality-test", tags=["personality-test"])


def _upstream_error_message(exc: httpx.HTTPStatusError) -> str:
    try:
        payload = exc.response.json()
        if isinstance(payload, dict):
            error = payload.get("error")
            if isinstance(error, dict):
                message = error.get("message")
                if isinstance(message, str) and message.strip():
                    return message.strip()
    except ValueError:
        pass

    text = exc.response.text.strip()
    return text[:300] if text else f"HTTP {exc.response.status_code}"


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
    except httpx.HTTPStatusError as exc:
        upstream_status = exc.response.status_code
        message = _upstream_error_message(exc)
        if upstream_status in {400, 401, 403, 404}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Gemini request rejected (HTTP {upstream_status}). "
                    f"Check GEMINI_API_KEY and GEMINI_MODEL. Upstream: {message}"
                ),
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini upstream error (HTTP {upstream_status}). Upstream: {message}",
        )
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LLM transport error: {type(exc).__name__}",
        )

    parsed_question = parse_assistant_message(assistant_message)
    return NextQuestionResponse(
        system_prompt=system_prompt,
        user_message=user_message,
        assistant_message=assistant_message,
        parsed_question=parsed_question,
        raw_response=raw_response,
    )
