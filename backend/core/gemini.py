from __future__ import annotations

import json
from typing import Any

import httpx

from core.config import settings


def _extract_text(response_json: dict[str, Any]) -> str:
    try:
        return response_json["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        return ""


def _clean_json_text(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()
    return cleaned


def generate_content(prompt: str, temperature: float | None = None) -> tuple[dict[str, Any], str]:
    if not settings.GEMINI_API_KEY:
        raise ValueError("Gemini is not configured")

    model = settings.GEMINI_MODEL
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={settings.GEMINI_API_KEY}"
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": settings.GEMINI_TEMPERATURE if temperature is None else temperature,
        },
    }

    with httpx.Client(timeout=settings.GEMINI_TIMEOUT_SECS) as client:
        response = client.post(url, json=payload)
        response.raise_for_status()

    data = response.json()
    text = _extract_text(data)
    return data, text


def generate_json(prompt: str, temperature: float | None = None) -> tuple[dict[str, Any], dict[str, Any] | None]:
    raw, text = generate_content(prompt, temperature=temperature)
    try:
        parsed = json.loads(_clean_json_text(text))
    except json.JSONDecodeError:
        parsed = None
    return raw, parsed
