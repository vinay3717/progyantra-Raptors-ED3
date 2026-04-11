from __future__ import annotations

from typing import Any

from core.gemini import generate_json


def _fallback_roadmap(skill: str, difficulty_band: str) -> dict[str, Any]:
    title = skill.replace("-", " ").title()
    return {
        "skill": skill,
        "difficulty_band": difficulty_band,
        "overview": {
            "description": f"{title} roadmap focused on practical outcomes and interview readiness.",
            "career_impact": f"{title} skills are in high demand across product, startup, and enterprise teams.",
            "syllabus_summary": [
                "Fundamentals and foundations",
                "Core tools and workflows",
                "Applied projects",
                "Deployment and optimization",
                "Interview and portfolio preparation",
            ],
            "program_outcomes": [
                f"Build production-ready {title} projects",
                "Solve practical assignments with confidence",
                "Demonstrate measurable skill growth",
                "Prepare for internships and full-time roles",
            ],
        },
        "units": [
            {
                "title": "Foundations",
                "unit_score": 30,
                "subpoints": [
                    {
                        "title": "Core concepts and terminology",
                        "assessment_type": "quiz",
                        "points_value": 10,
                    },
                    {
                        "title": "Guided beginner exercises",
                        "assessment_type": "task",
                        "points_value": 10,
                    },
                    {
                        "title": "Mini project",
                        "assessment_type": "project",
                        "points_value": 10,
                    },
                ],
            },
            {
                "title": "Intermediate Practice",
                "unit_score": 35,
                "subpoints": [
                    {
                        "title": "Real-world assignments",
                        "assessment_type": "task",
                        "points_value": 10,
                    },
                    {
                        "title": "Systematic problem solving",
                        "assessment_type": "quiz",
                        "points_value": 10,
                    },
                    {
                        "title": "Project implementation",
                        "assessment_type": "project",
                        "points_value": 15,
                    },
                ],
            },
            {
                "title": "Advanced Readiness",
                "unit_score": 35,
                "subpoints": [
                    {
                        "title": "Capstone project",
                        "assessment_type": "project",
                        "points_value": 15,
                    },
                    {
                        "title": "Portfolio refinement",
                        "assessment_type": "task",
                        "points_value": 10,
                    },
                    {
                        "title": "Interview preparation",
                        "assessment_type": "quiz",
                        "points_value": 10,
                    },
                ],
            },
        ],
    }


def generate_roadmap_payload(skill: str, difficulty_band: str) -> dict[str, Any]:
    prompt = f"""
You are designing a personalized learning roadmap.
Return strict JSON only with this schema:
{{
  "skill": "slug-format",
  "difficulty_band": "beginner|intermediate|advanced",
  "overview": {{
    "description": "string",
    "career_impact": "string",
    "syllabus_summary": ["string", "..."],
    "program_outcomes": ["string", "..."]
  }},
  "units": [
    {{
      "title": "string",
      "unit_score": 0-100,
      "subpoints": [
        {{
          "title": "string",
          "assessment_type": "quiz|task|project|none",
          "practice_url": "optional string",
          "learning_resource_url": "optional string",
          "points_value": 1-50
        }}
      ]
    }}
  ]
}}
Constraints:
- skill should be "{skill}".
- difficulty_band should be "{difficulty_band}".
- exactly 3 units, each with 3-4 subpoints.
- total unit_score should add to 100.
- keep content concise and practical.
"""
    try:
        _raw, parsed = generate_json(prompt, temperature=0.3)
    except Exception:
        parsed = None

    if not isinstance(parsed, dict):
        return _fallback_roadmap(skill, difficulty_band)

    # Normalize malformed outputs with fallback defaults.
    parsed_skill = str(parsed.get("skill") or skill).strip().lower().replace(" ", "-")
    parsed_difficulty = str(parsed.get("difficulty_band") or difficulty_band).strip().lower()
    if parsed_difficulty not in {"beginner", "intermediate", "advanced"}:
        parsed_difficulty = difficulty_band

    overview = parsed.get("overview")
    if not isinstance(overview, dict):
        overview = {}

    units = parsed.get("units")
    if not isinstance(units, list) or not units:
        return _fallback_roadmap(parsed_skill, parsed_difficulty)

    fallback_subpoints = _fallback_roadmap(parsed_skill, parsed_difficulty)["units"][0]["subpoints"]

    normalized_units: list[dict[str, Any]] = []
    for unit in units[:3]:
        if not isinstance(unit, dict):
            continue
        title = str(unit.get("title") or "Untitled Unit").strip()
        unit_score = int(unit.get("unit_score") or 0)
        subpoints_raw = unit.get("subpoints") if isinstance(unit.get("subpoints"), list) else []
        normalized_subpoints: list[dict[str, Any]] = []
        for point in subpoints_raw[:4]:
            if not isinstance(point, dict):
                continue
            normalized_subpoints.append(
                {
                    "title": str(point.get("title") or "Practice").strip(),
                    "assessment_type": str(point.get("assessment_type") or "none").strip().lower(),
                    "practice_url": point.get("practice_url"),
                    "learning_resource_url": point.get("learning_resource_url"),
                    "points_value": int(point.get("points_value") or 10),
                }
            )
        if not normalized_subpoints:
            normalized_subpoints = fallback_subpoints
        normalized_units.append(
            {
                "title": title,
                "unit_score": max(unit_score, 10),
                "subpoints": normalized_subpoints,
            }
        )

    if not normalized_units:
        return _fallback_roadmap(parsed_skill, parsed_difficulty)

    # Re-balance unit scores to 100.
    if len(normalized_units) == 3:
        normalized_units[0]["unit_score"] = 30
        normalized_units[1]["unit_score"] = 35
        normalized_units[2]["unit_score"] = 35

    return {
        "skill": parsed_skill,
        "difficulty_band": parsed_difficulty,
        "overview": {
            "description": str(
                overview.get("description")
                or f"{parsed_skill.replace('-', ' ').title()} roadmap tailored for career growth."
            ),
            "career_impact": str(
                overview.get("career_impact")
                or "This skill improves employability across multiple technology roles."
            ),
            "syllabus_summary": (
                overview.get("syllabus_summary")
                if isinstance(overview.get("syllabus_summary"), list)
                else ["Foundations", "Core Practice", "Projects", "Career Readiness"]
            ),
            "program_outcomes": (
                overview.get("program_outcomes")
                if isinstance(overview.get("program_outcomes"), list)
                else ["Build practical projects", "Prepare for interviews"]
            ),
        },
        "units": normalized_units,
    }
