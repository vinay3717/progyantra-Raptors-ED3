import os
import sys
import unittest
from unittest.mock import patch

import httpx
from httpx import ASGITransport

BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_ROOT not in sys.path:
    sys.path.append(BACKEND_ROOT)

from login_signup.app import app
from login_signup.skill_recommendation import service as skill_service


def build_sample_job_results():
    return [
        {
            "query": "AI Engineer India",
            "total_results": 2,
            "jobs": [
                {
                    "job_title": "AI Engineer",
                    "company_name": "Test Corp",
                    "location": "Pune, India",
                    "employment_type": "full_time",
                    "salary_min": 12.0,
                    "salary_max": 30.0,
                    "salary_currency": "INR",
                    "salary_period": "year",
                    "apply_link": "https://example.com/apply",
                }
            ],
        }
    ]


class SkillRecommendationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        transport = ASGITransport(app=app)
        self.client = httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        )

    async def asyncTearDown(self):
        await self.client.aclose()

    async def test_prompt_uses_provided_job_results(self):
        payload = {
            "target_skill": "AI Engineer",
            "personality_scores": {"learning_pace": "slow"},
            "job_results": build_sample_job_results(),
        }
        response = await self.client.post(
            "/skill-recommendation/prompt",
            json=payload,
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("system_prompt", data)
        self.assertIn("user_message", data)
        self.assertIn("messages", data)
        self.assertEqual(len(data["messages"]), 2)
        self.assertIn("AI Engineer", data["system_prompt"])

    async def test_generate_requires_llm_config(self):
        payload = {
            "target_skill": "AI Engineer",
            "personality_scores": {"learning_pace": "slow"},
            "job_results": build_sample_job_results(),
        }
        with patch.object(skill_service, "LLM_API_URL", ""):
            with patch.object(skill_service, "LLM_API_KEY", ""):
                with patch.object(skill_service, "LLM_MODEL", ""):
                    response = await self.client.post(
                        "/skill-recommendation/generate",
                        json=payload,
                    )
        self.assertEqual(response.status_code, 400)
        self.assertIn("LLM is not configured", response.json()["detail"])

    async def test_jobs_requires_api_key(self):
        payload = {"queries": ["AI Engineer India"], "page": 1, "num_pages": 1}
        with patch.object(skill_service, "JSEARCH_API_KEY", ""):
            response = await self.client.post(
                "/skill-recommendation/jobs",
                json=payload,
            )
        self.assertEqual(response.status_code, 400)
        self.assertIn("JSearch is not configured", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
