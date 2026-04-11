from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class JobListing(BaseModel):
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = None
    salary_period: Optional[str] = None
    apply_link: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class JobSearchResult(BaseModel):
    query: str
    total_results: int
    jobs: List[JobListing]

    model_config = ConfigDict(extra="forbid")


class JobSearchRequest(BaseModel):
    queries: List[str] = Field(default_factory=list)
    page: int = 1
    num_pages: int = 1
    max_jobs_per_query: int = 20
    include_raw_jobs: bool = False

    model_config = ConfigDict(extra="forbid")


class JobSearchResponse(BaseModel):
    results: List[JobSearchResult]
    raw_responses: Optional[List[dict[str, Any]]] = None

    model_config = ConfigDict(extra="forbid")


class SkillRecommendationRequest(JobSearchRequest):
    target_skill: Optional[str] = None
    personality_scores: Optional[dict[str, Any]] = None
    job_results: Optional[List[JobSearchResult]] = None

    model_config = ConfigDict(extra="forbid")


class PromptMessage(BaseModel):
    role: str
    content: str

    model_config = ConfigDict(extra="forbid")


class PromptResponse(BaseModel):
    system_prompt: str
    user_message: str
    messages: List[PromptMessage]

    model_config = ConfigDict(extra="forbid")


class SkillRecommendationResponse(BaseModel):
    system_prompt: str
    user_message: str
    assistant_message: str
    parsed_recommendations: Optional[dict[str, Any]] = None
    job_results: List[JobSearchResult]
    raw_llm_response: dict[str, Any]
    raw_jsearch_responses: Optional[List[dict[str, Any]]] = None

    model_config = ConfigDict(extra="forbid")
