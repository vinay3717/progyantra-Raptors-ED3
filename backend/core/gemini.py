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


def _model_candidates() -> list[str]:
    preferred = settings.GEMINI_MODEL.strip()
    fallbacks = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ]
    candidates: list[str] = []
    for model in [preferred, *fallbacks]:
        if model and model not in candidates:
            candidates.append(model)
    return candidates


def _is_model_not_found(exc: httpx.HTTPStatusError) -> bool:
    status = exc.response.status_code
    if status not in {400, 404}:
        return False

    text = exc.response.text.lower()
    return (
        "not found" in text
        or "not supported for api version" in text
        or "is not supported" in text
    )


def generate_content(prompt: str, temperature: float | None = None) -> tuple[dict[str, Any], str]:
    if not settings.GEMINI_API_KEY:
        raise ValueError("Gemini is not configured")

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": settings.GEMINI_TEMPERATURE if temperature is None else temperature,
        },
    }

    last_error: httpx.HTTPError | None = None
    with httpx.Client(timeout=settings.GEMINI_TIMEOUT_SECS) as client:
        for model in _model_candidates():
            url = (
                f"https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent?key={settings.GEMINI_API_KEY}"
            )
            try:
                response = client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                text = _extract_text(data)
                return data, text
            except httpx.HTTPStatusError as exc:
                last_error = exc
                # If configured model is unavailable for this API version, try fallback models.
                if _is_model_not_found(exc):
                    continue
                raise
            except httpx.HTTPError as exc:
                last_error = exc
                raise

    if last_error:
        raise last_error
    raise ValueError("Gemini request failed")


def generate_json(prompt: str, temperature: float | None = None) -> tuple[dict[str, Any], dict[str, Any] | None]:
    raw, text = generate_content(prompt, temperature=temperature)
    try:
        parsed = json.loads(_clean_json_text(text))
    except json.JSONDecodeError:
        parsed = None
    return raw, parsed
