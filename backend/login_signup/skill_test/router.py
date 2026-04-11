import httpx
from fastapi import APIRouter, HTTPException, status

from .schemas import (
    BeginnerTestAnswerRequest,
    BeginnerTestStartRequest,
    BeginnerTestStepResponse,
)
from .service import answer_beginner_test, start_beginner_test

router = APIRouter(prefix="/beginner-test", tags=["beginner-test"])


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


@router.post("/start", response_model=BeginnerTestStepResponse)
def start_test(body: BeginnerTestStartRequest) -> BeginnerTestStepResponse:
    try:
        return start_beginner_test(
            selected_skill=body.selected_skill,
            personality_scores=body.personality_scores,
            min_questions=body.min_questions,
            max_questions=body.max_questions,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
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


@router.post("/answer", response_model=BeginnerTestStepResponse)
def answer_test(body: BeginnerTestAnswerRequest) -> BeginnerTestStepResponse:
    try:
        return answer_beginner_test(
            session_id=body.session_id,
            answer=body.answer,
        )
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beginner test session not found or expired. Please start again.",
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
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
