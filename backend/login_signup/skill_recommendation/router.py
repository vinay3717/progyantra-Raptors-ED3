from fastapi import APIRouter, HTTPException, status
import httpx

from .schemas import (
    JobSearchRequest,
    JobSearchResponse,
    PromptResponse,
    SkillRecommendationRequest,
    SkillRecommendationResponse,
)
from .service import (
    DEFAULT_QUERIES,
    build_messages,
    call_llm,
    fetch_job_results,
    parse_assistant_message,
)

router = APIRouter(prefix="/skill-recommendation", tags=["skill-recommendation"])


def resolve_queries(request: JobSearchRequest) -> list[str]:
    return request.queries or DEFAULT_QUERIES


@router.post("/jobs", response_model=JobSearchResponse)
async def get_jobs(request: JobSearchRequest) -> JobSearchResponse:
    try:
        job_results, raw_responses = await fetch_job_results(
            resolve_queries(request),
            request.page,
            request.num_pages,
            request.max_jobs_per_query,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="JSearch is not configured. Set JSEARCH_API_KEY.",
        )
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"JSearch request failed: {exc}",
        )

    return JobSearchResponse(
        results=job_results,
        raw_responses=raw_responses if request.include_raw_jobs else None,
    )


@router.post("/prompt", response_model=PromptResponse)
async def get_prompt(request: SkillRecommendationRequest) -> PromptResponse:
    if request.job_results:
        job_results = request.job_results
    else:
        try:
            job_results, _ = await fetch_job_results(
                resolve_queries(request),
                request.page,
                request.num_pages,
                request.max_jobs_per_query,
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="JSearch is not configured. Set JSEARCH_API_KEY.",
            )
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"JSearch request failed: {exc}",
            )

    system_prompt, user_message, messages = build_messages(
        request.target_skill, request.personality_scores, job_results
    )
    return PromptResponse(
        system_prompt=system_prompt,
        user_message=user_message,
        messages=messages,
    )


@router.post("/generate", response_model=SkillRecommendationResponse)
async def generate_recommendations(
    request: SkillRecommendationRequest,
) -> SkillRecommendationResponse:
    raw_jsearch_responses = None
    if request.job_results:
        job_results = request.job_results
    else:
        try:
            job_results, raw_jsearch_responses = await fetch_job_results(
                resolve_queries(request),
                request.page,
                request.num_pages,
                request.max_jobs_per_query,
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="JSearch is not configured. Set JSEARCH_API_KEY.",
            )
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"JSearch request failed: {exc}",
            )

    system_prompt, user_message, messages = build_messages(
        request.target_skill, request.personality_scores, job_results
    )
    try:
        raw_response, assistant_message = call_llm(messages)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "LLM is not configured. Set LLM_API_URL, LLM_API_KEY, and "
                "LLM_MODEL or use /skill-recommendation/prompt."
            ),
        )

    parsed_recommendations = parse_assistant_message(assistant_message)
    return SkillRecommendationResponse(
        system_prompt=system_prompt,
        user_message=user_message,
        assistant_message=assistant_message,
        parsed_recommendations=parsed_recommendations,
        job_results=job_results,
        raw_llm_response=raw_response,
        raw_jsearch_responses=raw_jsearch_responses
        if request.include_raw_jobs
        else None,
    )
