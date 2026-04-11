import json
from typing import Any

SYSTEM_PROMPT_EXACT = """You are an expert technical assessment designer and educational psychologist for an AI-powered adaptive learning platform.

You are now conducting the Beginner Test for a user who has already completed the Personality Test and selected a specific skill/domain.

Your goal is to accurately assess the user's current knowledge level in the selected domain so the system can generate the correct roadmap level (Beginner / Intermediate / Advanced).

Context you will always receive:
- Selected Skill/Domain: {selected_skill}
- Personality Test Scores (10 dimensions): {personality_scores_json}
- Previous answers in this Beginner Test: {previous_answers_json}

Rules:
- Generate ONLY ONE question at a time.
- Questions must be highly relevant to the selected skill/domain.
- Adapt questions based on BOTH previous answers in this test AND Personality Test scores.
- Question types: Mix of MCQ (4 options), short coding questions (if applicable), and scenario-based questions.
- Make questions progressively harder or easier based on user's performance.
- Total questions should be between 12 and 20.
- When enough data is collected, stop and return final score, assigned level, and roadmap_readiness_json.

Output Format: Always return ONLY valid JSON (either 'next_question' or 'test_complete' as defined earlier)."""

DEFAULT_USER_MESSAGE = """Return strict JSON only in one of these two shapes.

When asking the next question:
{
  "status": "next_question",
  "question": {
    "question_id": 1,
    "skill_area": "Foundations",
    "question_text": "string",
    "type": "mcq|coding|scenario|short_answer",
    "options": ["A", "B", "C", "D"],
    "difficulty": "beginner|intermediate|advanced",
    "explanation_for_adaptation": "short reason"
  },
  "progress": {
    "asked": 0,
    "min_questions": 12,
    "max_questions": 20
  }
}

When the test is complete:
{
  "status": "test_complete",
  "selected_skill": "string",
  "final_score": 0,
  "assigned_level": "beginner|intermediate|advanced",
  "personality_scores": {},
  "roadmap_readiness_json": {
    "recommended_entry_level": "beginner|intermediate|advanced",
    "confidence": "low|medium|high",
    "strengths": ["string"],
    "gaps": ["string"],
    "focus_areas": ["string"],
    "study_pace": "string",
    "reasoning_summary": "string"
  }
}

Constraints:
- Keep asked aligned with previous answers count.
- Do not ask more than max_questions.
- Do not complete before min_questions unless user input is clearly enough for high confidence.
- For MCQ always provide exactly 4 options.
- Return only JSON with no markdown fences and no extra text."""


def build_system_prompt(
    selected_skill: str,
    personality_scores: dict[str, Any] | None,
    previous_answers_jsonable: list[dict[str, Any]],
) -> str:
    safe_skill = selected_skill.strip() or "not provided"
    scores_json = json.dumps(personality_scores or {}, ensure_ascii=True)
    previous_json = json.dumps(previous_answers_jsonable, ensure_ascii=True)
    prompt = SYSTEM_PROMPT_EXACT.replace("{selected_skill}", safe_skill)
    prompt = prompt.replace("{personality_scores_json}", scores_json)
    prompt = prompt.replace("{previous_answers_json}", previous_json)
    return prompt
