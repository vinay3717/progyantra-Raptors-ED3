from __future__ import annotations

import json
import os
import threading
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import httpx

from core.gemini import generate_content

from .prompt import DEFAULT_USER_MESSAGE, build_system_prompt
from .schemas import (
    BeginnerProgress,
    BeginnerQuestion,
    BeginnerTestStepResponse,
    PreviousAnswer,
    PromptMessage,
)

LLM_API_URL = os.getenv("LLM_API_URL", "")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.35"))
LLM_TIMEOUT_SECS = float(os.getenv("LLM_TIMEOUT_SECS", "30"))

_STORE_LOCK = threading.Lock()


@dataclass
class BeginnerTestSession:
    session_id: str
    selected_skill: str
    personality_scores: dict[str, Any]
    min_questions: int
    max_questions: int
    previous_answers: list[PreviousAnswer] = field(default_factory=list)
    current_question: BeginnerQuestion | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


_SESSIONS: dict[str, BeginnerTestSession] = {}


def _level_from_score(score: int) -> str:
    if score >= 75:
        return "advanced"
    if score >= 45:
        return "intermediate"
    return "beginner"


def _compute_fallback_score(previous_answers: list[PreviousAnswer]) -> int:
    if not previous_answers:
        return 40

    quality_total = 0.0
    for answer in previous_answers:
        text = answer.answer.strip()
        if len(text) >= 80:
            quality_total += 0.85
        elif len(text) >= 30:
            quality_total += 0.65
        elif len(text) >= 10:
            quality_total += 0.45
        else:
            quality_total += 0.25

    avg_quality = quality_total / len(previous_answers)
    return max(30, min(90, int(25 + avg_quality * 75)))


def _clean_json_text(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()
    return cleaned


def _parse_assistant_payload(message: str) -> dict[str, Any] | None:
    try:
        return json.loads(_clean_json_text(message))
    except json.JSONDecodeError:
        return None


def _build_messages(
    selected_skill: str,
    personality_scores: dict[str, Any] | None,
    previous_answers: list[PreviousAnswer],
) -> tuple[str, str, list[PromptMessage]]:
    answers_payload = [answer.model_dump() for answer in previous_answers]
    system_prompt = build_system_prompt(
        selected_skill,
        personality_scores,
        answers_payload,
    )
    user_message = DEFAULT_USER_MESSAGE
    messages = [
        PromptMessage(role="system", content=system_prompt),
        PromptMessage(role="user", content=user_message),
    ]
    return system_prompt, user_message, messages


def _call_llm(messages: list[PromptMessage]) -> tuple[dict[str, Any], str]:
    combined_prompt = "\n\n".join(
        [f"{message.role.upper()}:\n{message.content}" for message in messages]
    )

    try:
        raw, text = generate_content(combined_prompt, temperature=LLM_TEMPERATURE)
        if text:
            return raw, text
    except ValueError:
        pass

    if not LLM_API_URL or not LLM_API_KEY or not LLM_MODEL:
        raise ValueError("LLM is not configured")

    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": LLM_MODEL,
        "messages": [message.model_dump() for message in messages],
        "temperature": LLM_TEMPERATURE,
    }

    with httpx.Client(timeout=LLM_TIMEOUT_SECS) as client:
        response = client.post(LLM_API_URL, json=payload, headers=headers)
        response.raise_for_status()

    data = response.json()
    content = ""
    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        content = ""
    return data, content


def _fallback_next_question(
    *,
    selected_skill: str,
    asked: int,
    min_questions: int,
    max_questions: int,
) -> BeginnerTestStepResponse:
    qid = asked + 1
    return BeginnerTestStepResponse(
        session_id="",
        status="next_question",
        selected_skill=selected_skill,
        question=BeginnerQuestion(
            question_id=qid,
            skill_area="Foundations",
            question_text=(
                f"In {selected_skill.replace('-', ' ')}, which option best explains a core concept "
                f"you would use in a beginner project?"
            ),
            type="mcq",
            options=[
                "Option A",
                "Option B",
                "Option C",
                "Option D",
            ],
            difficulty="beginner" if asked < 4 else "intermediate",
            explanation_for_adaptation="Fallback question due to invalid model response.",
        ),
        progress=BeginnerProgress(
            asked=asked,
            min_questions=min_questions,
            max_questions=max_questions,
        ),
    )


def _fallback_completion(
    *,
    selected_skill: str,
    personality_scores: dict[str, Any] | None,
    previous_answers: list[PreviousAnswer],
) -> BeginnerTestStepResponse:
    score = _compute_fallback_score(previous_answers)
    level = _level_from_score(score)
    return BeginnerTestStepResponse(
        session_id="",
        status="test_complete",
        selected_skill=selected_skill,
        final_score=score,
        assigned_level=level,  # type: ignore[arg-type]
        personality_scores=personality_scores or {},
        roadmap_readiness_json={
            "recommended_entry_level": level,
            "confidence": "medium",
            "strengths": ["Consistent participation"],
            "gaps": ["Needs deeper domain-specific practice"],
            "focus_areas": ["Core concepts", "Applied tasks", "Practical problem solving"],
            "study_pace": "steady",
            "reasoning_summary": "Fallback completion generated from answer quality heuristics.",
        },
    )


def _normalize_payload(
    *,
    parsed: dict[str, Any] | None,
    selected_skill: str,
    personality_scores: dict[str, Any] | None,
    asked: int,
    min_questions: int,
    max_questions: int,
    previous_answers: list[PreviousAnswer],
) -> BeginnerTestStepResponse:
    if not isinstance(parsed, dict):
        if asked >= min_questions:
            return _fallback_completion(
                selected_skill=selected_skill,
                personality_scores=personality_scores,
                previous_answers=previous_answers,
            )
        return _fallback_next_question(
            selected_skill=selected_skill,
            asked=asked,
            min_questions=min_questions,
            max_questions=max_questions,
        )

    status = str(parsed.get("status") or "").strip().lower()
    if status == "test_complete":
        final_score_raw = parsed.get("final_score")
        final_score = (
            int(final_score_raw)
            if isinstance(final_score_raw, (int, float))
            else _compute_fallback_score(previous_answers)
        )
        final_score = max(0, min(100, final_score))

        assigned_level_raw = str(parsed.get("assigned_level") or "").strip().lower()
        if assigned_level_raw not in {"beginner", "intermediate", "advanced"}:
            assigned_level_raw = _level_from_score(final_score)

        readiness = parsed.get("roadmap_readiness_json")
        if not isinstance(readiness, dict):
            readiness = {
                "recommended_entry_level": assigned_level_raw,
                "confidence": "medium",
                "strengths": ["Shows engagement with assessment tasks"],
                "gaps": ["Requires additional guided practice in weaker areas"],
                "focus_areas": ["Fundamentals", "Problem solving", "Hands-on exercises"],
                "study_pace": "steady",
                "reasoning_summary": "Generated with fallback readiness template.",
            }

        if asked < min_questions:
            return _fallback_next_question(
                selected_skill=selected_skill,
                asked=asked,
                min_questions=min_questions,
                max_questions=max_questions,
            )

        return BeginnerTestStepResponse(
            session_id="",
            status="test_complete",
            selected_skill=selected_skill,
            final_score=final_score,
            assigned_level=assigned_level_raw,  # type: ignore[arg-type]
            personality_scores=(
                parsed.get("personality_scores")
                if isinstance(parsed.get("personality_scores"), dict)
                else (personality_scores or {})
            ),
            roadmap_readiness_json=readiness,
        )

    # Default branch: next_question.
    if asked >= max_questions:
        return _fallback_completion(
            selected_skill=selected_skill,
            personality_scores=personality_scores,
            previous_answers=previous_answers,
        )

    question_raw = parsed.get("question")
    if not isinstance(question_raw, dict):
        return _fallback_next_question(
            selected_skill=selected_skill,
            asked=asked,
            min_questions=min_questions,
            max_questions=max_questions,
        )

    qid_raw = question_raw.get("question_id")
    qid = int(qid_raw) if isinstance(qid_raw, (int, float)) else asked + 1
    qid = max(1, qid)

    q_type = str(question_raw.get("type") or "mcq").strip().lower()
    if q_type not in {"mcq", "coding", "scenario", "short_answer"}:
        q_type = "short_answer"

    options_raw = question_raw.get("options")
    options: list[str] = []
    if isinstance(options_raw, list):
        options = [str(item).strip() for item in options_raw if str(item).strip()]
    if q_type == "mcq":
        options = options[:4]
        while len(options) < 4:
            options.append(f"Option {chr(65 + len(options))}")
    else:
        options = []

    difficulty_raw = str(question_raw.get("difficulty") or "beginner").strip().lower()
    if difficulty_raw not in {"beginner", "intermediate", "advanced"}:
        difficulty_raw = "beginner"

    return BeginnerTestStepResponse(
        session_id="",
        status="next_question",
        selected_skill=selected_skill,
        question=BeginnerQuestion(
            question_id=qid,
            skill_area=str(question_raw.get("skill_area") or "Foundations").strip() or "Foundations",
            question_text=(
                str(question_raw.get("question_text") or "").strip()
                or "Explain one core concept from this domain."
            ),
            type=q_type,  # type: ignore[arg-type]
            options=options,
            difficulty=difficulty_raw,  # type: ignore[arg-type]
            explanation_for_adaptation=(
                str(question_raw.get("explanation_for_adaptation")).strip()
                if question_raw.get("explanation_for_adaptation") is not None
                else None
            ),
        ),
        progress=BeginnerProgress(
            asked=asked,
            min_questions=min_questions,
            max_questions=max_questions,
        ),
    )


def _generate_step(session: BeginnerTestSession) -> BeginnerTestStepResponse:
    _system_prompt, _user_message, messages = _build_messages(
        session.selected_skill,
        session.personality_scores,
        session.previous_answers,
    )
    raw_response, assistant_message = _call_llm(messages)
    parsed = _parse_assistant_payload(assistant_message)
    step = _normalize_payload(
        parsed=parsed,
        selected_skill=session.selected_skill,
        personality_scores=session.personality_scores,
        asked=len(session.previous_answers),
        min_questions=session.min_questions,
        max_questions=session.max_questions,
        previous_answers=session.previous_answers,
    )
    step.raw_response = raw_response
    return step


def start_beginner_test(
    *,
    selected_skill: str,
    personality_scores: dict[str, Any] | None,
    min_questions: int,
    max_questions: int,
) -> BeginnerTestStepResponse:
    if min_questions > max_questions:
        raise ValueError("min_questions cannot be greater than max_questions")

    session = BeginnerTestSession(
        session_id=str(uuid.uuid4()),
        selected_skill=selected_skill.strip(),
        personality_scores=personality_scores or {},
        min_questions=min_questions,
        max_questions=max_questions,
    )

    step = _generate_step(session)
    step.session_id = session.session_id
    if step.status == "next_question" and step.question:
        session.current_question = step.question
        with _STORE_LOCK:
            _SESSIONS[session.session_id] = session
    else:
        # In rare cases where the model returns completion immediately.
        with _STORE_LOCK:
            _SESSIONS.pop(session.session_id, None)
    return step


def answer_beginner_test(*, session_id: str, answer: str) -> BeginnerTestStepResponse:
    with _STORE_LOCK:
        session = _SESSIONS.get(session_id)

    if not session:
        raise KeyError("Session not found or expired")

    if not session.current_question:
        raise ValueError("Current question not found for this session")

    session.previous_answers.append(
        PreviousAnswer(
            question_id=session.current_question.question_id,
            skill_area=session.current_question.skill_area,
            question_text=session.current_question.question_text,
            question_type=session.current_question.type,
            answer=answer.strip(),
        )
    )
    session.updated_at = datetime.now(timezone.utc)

    step = _generate_step(session)
    step.session_id = session.session_id

    if step.status == "next_question" and step.question:
        session.current_question = step.question
        with _STORE_LOCK:
            _SESSIONS[session.session_id] = session
        return step

    # Completed flow.
    with _STORE_LOCK:
        _SESSIONS.pop(session.session_id, None)
    return step
