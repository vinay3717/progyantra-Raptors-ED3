import { AssessmentOverviewSchema } from "./schemas";
import { generateJsonWithGemini } from "./gemini";

export async function generateAssessmentOverview(input: {
  skill: string;
  score: number;
  total: number;
  wrongQuestions: Array<{ prompt: string; chosen: string; correct: string }>;
}) {
  const prompt = [
    "You are an AI mentor generating an assessment overview for a learner.",
    "Return ONLY valid JSON (no markdown).",
    "",
    "JSON shape:",
    "{",
    '  "headline": "...",',
    '  "score_summary": "...",',
    '  "strengths": ["..."],',
    '  "gaps": ["..."],',
    '  "recommended_focus": ["..."],',
    '  "reroute": true|false,',
    '  "injected_nodes": ["..."]',
    "}",
    "",
    "Rules:",
    "- If learner has 3+ wrong answers OR score < 50%, set reroute=true and propose 2-4 injected_nodes.",
    "- Keep recommendations actionable and short.",
    "",
    `Skill: ${input.skill}`,
    `Score: ${input.score}/${input.total}`,
    "",
    "Wrong questions (if any):",
    JSON.stringify(input.wrongQuestions, null, 2),
  ].join("\n");

  return generateJsonWithGemini(AssessmentOverviewSchema, prompt, { temperature: 0.2 });
}

