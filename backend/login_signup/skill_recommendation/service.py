import asyncio
import json
import os
from typing import Any, List, Tuple

import httpx
from dotenv import load_dotenv

from .prompt import DEFAULT_USER_MESSAGE, build_system_prompt
from .schemas import JobListing, JobSearchResult, PromptMessage

load_dotenv()

JSEARCH_API_URL = os.getenv("JSEARCH_API_URL", "https://jsearch.p.rapidapi.com/search")
JSEARCH_API_HOST = os.getenv("JSEARCH_API_HOST", "jsearch.p.rapidapi.com")
JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY", "")
JSEARCH_TIMEOUT_SECS = float(os.getenv("JSEARCH_TIMEOUT_SECS", "30"))

LLM_API_URL = os.getenv("LLM_API_URL", "")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.4"))
LLM_TIMEOUT_SECS = float(os.getenv("LLM_TIMEOUT_SECS", "30"))

DEFAULT_QUERIES = [
    "AI Engineer India",
    "Machine Learning Engineer India",
    "Data Scientist India",
    "Prompt Engineer India",
    "Cloud Architect India",
    "Full Stack Developer India",
    "Cybersecurity India",
]


def build_messages(
    target_skill: str | None,
    personality_scores: dict[str, Any] | None,
    job_results: List[JobSearchResult],
) -> Tuple[str, str, List[PromptMessage]]:
    system_prompt = build_system_prompt(target_skill, personality_scores, job_results)
    user_message = DEFAULT_USER_MESSAGE
    messages = [
        PromptMessage(role="system", content=system_prompt),
        PromptMessage(role="user", content=user_message),
    ]
    return system_prompt, user_message, messages


def normalize_job(job: dict[str, Any]) -> JobListing:
    location_parts = [
        job.get("job_city"),
        job.get("job_state"),
        job.get("job_country"),
    ]
    location = ", ".join(part for part in location_parts if part)
    return JobListing(
        job_title=job.get("job_title"),
        company_name=job.get("employer_name"),
        location=location or None,
        employment_type=job.get("job_employment_type"),
        salary_min=job.get("job_min_salary"),
        salary_max=job.get("job_max_salary"),
        salary_currency=job.get("job_salary_currency"),
        salary_period=job.get("job_salary_period"),
        apply_link=job.get("job_apply_link"),
    )


def parse_jsearch_payload(
    query: str, payload: dict[str, Any], max_jobs: int
) -> JobSearchResult:
    jobs = payload.get("data", []) or []
    trimmed_jobs = jobs[:max_jobs] if max_jobs > 0 else jobs
    normalized = [normalize_job(job) for job in trimmed_jobs]
    total_results = payload.get("total_results")
    if not isinstance(total_results, int):
        total_results = len(jobs)
    return JobSearchResult(query=query, total_results=total_results, jobs=normalized)


async def fetch_jsearch(
    client: httpx.AsyncClient,
    query: str,
    page: int,
    num_pages: int,
) -> dict[str, Any]:
    if not JSEARCH_API_KEY:
        raise ValueError("JSearch is not configured")

    headers = {
        "X-RapidAPI-Key": JSEARCH_API_KEY,
        "X-RapidAPI-Host": JSEARCH_API_HOST,
    }
    params = {
        "query": query,
        "page": page,
        "num_pages": num_pages,
    }
    response = await client.get(JSEARCH_API_URL, headers=headers, params=params)
    response.raise_for_status()
    return response.json()


async def fetch_job_results(
    queries: List[str],
    page: int,
    num_pages: int,
    max_jobs_per_query: int,
) -> Tuple[List[JobSearchResult], List[dict[str, Any]]]:
    async with httpx.AsyncClient(timeout=JSEARCH_TIMEOUT_SECS) as client:
        tasks = [fetch_jsearch(client, query, page, num_pages) for query in queries]
        raw_responses = await asyncio.gather(*tasks)

    results = [
        parse_jsearch_payload(query, payload, max_jobs_per_query)
        for query, payload in zip(queries, raw_responses)
    ]
    return results, raw_responses


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
