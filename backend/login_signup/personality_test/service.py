import json
import os
from typing import Any, List, Tuple

import httpx

from core.gemini import generate_content

from .prompt import DEFAULT_USER_MESSAGE, build_system_prompt
from .schemas import PreviousAnswer, PromptMessage

LLM_API_URL = os.getenv("LLM_API_URL", "")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.4"))
LLM_TIMEOUT_SECS = float(os.getenv("LLM_TIMEOUT_SECS", "30"))


def build_messages(
    target_skill: str | None, previous_answers: List[PreviousAnswer]
) -> Tuple[str, str, List[PromptMessage]]:
    system_prompt = build_system_prompt(target_skill, previous_answers)
    user_message = DEFAULT_USER_MESSAGE
    messages = [
        PromptMessage(role="system", content=system_prompt),
        PromptMessage(role="user", content=user_message),
    ]
    return system_prompt, user_message, messages


def call_llm(messages: List[PromptMessage]) -> Tuple[dict[str, Any], str]:
    combined_prompt = "\n\n".join(
        [f"{message.role.upper()}:\n{message.content}" for message in messages]
    )

    # Preferred path: Gemini.
    try:
        raw, text = generate_content(combined_prompt, temperature=LLM_TEMPERATURE)
        if text:
            return raw, text
    except ValueError:
        # Gemini not configured; try generic LLM fallback below.
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


def parse_assistant_message(message: str) -> dict[str, Any] | None:
    # Try to parse JSON; return None if the model output is not valid JSON.
    cleaned = message.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return None
