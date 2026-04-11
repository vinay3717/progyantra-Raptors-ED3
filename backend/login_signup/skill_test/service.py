import json
import os
from typing import Any, List, Tuple

import httpx

from .prompt import DEFAULT_USER_MESSAGE, build_system_prompt
from .schemas import PreviousAnswer, PromptMessage

LLM_API_URL = os.getenv("LLM_API_URL", "")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.4"))
LLM_TIMEOUT_SECS = float(os.getenv("LLM_TIMEOUT_SECS", "30"))


def build_messages(
    selected_skill: str,
    personality_scores: dict[str, Any] | None,
    previous_answers: List[PreviousAnswer],
    max_questions: int,
) -> Tuple[str, str, List[PromptMessage]]:
    system_prompt = build_system_prompt(
        selected_skill,
        personality_scores,
        previous_answers,
        max_questions,
    )
    user_message = DEFAULT_USER_MESSAGE
    messages = [
        PromptMessage(role="system", content=system_prompt),
        PromptMessage(role="user", content=user_message),
    ]
    return system_prompt, user_message, messages


def call_llm(messages: List[PromptMessage]) -> Tuple[dict[str, Any], str]:
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


def parse_assistant_message(message: str) -> dict[str, Any] | None:
    try:
        return json.loads(message)
    except json.JSONDecodeError:
        return None
