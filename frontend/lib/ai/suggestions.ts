import { SuggestionsResponseSchema } from "./schemas";
import { generateJsonWithGemini } from "./gemini";

export async function generatePathSuggestions(input: {
  resumeText: string;
  goal: string;
  currentSkill?: string;
}) {
  const resume = input.resumeText.trim().slice(0, 12000);
  const goal = input.goal.trim().slice(0, 4000);
  const currentSkill = (input.currentSkill ?? "").trim().slice(0, 200);

  const prompt = [
    "You are an AI career advisor. Generate 3 learning path suggestions.",
    "Return ONLY valid JSON (no markdown).",
    "",
    "JSON shape:",
    "{",
    '  "suggestions": [',
    '    { "title": "...", "target_skill": "...", "difficulty_band":"beginner|intermediate|advanced", "rationale":"...", "first_week_plan":["..."] }',
    "  ]",
    "}",
    "",
    "Rules:",
    "- Keep titles short and premium.",
    "- Use the resume strengths and gaps.",
    "- first_week_plan should be 4-7 items, short and doable.",
    "",
    currentSkill ? `Current skill: ${currentSkill}` : "",
    `Goal: ${goal}`,
    "",
    "Resume text:",
    resume,
  ]
    .filter(Boolean)
    .join("\n");

  return generateJsonWithGemini(SuggestionsResponseSchema, prompt, { temperature: 0.3 });
}

