import { generateJsonWithGemini } from "./gemini";
import { TestQuestionsResponseSchema } from "./schemas";

export async function generateRagStyleQuestions(input: {
  skill: string;
  difficultyBand?: "beginner" | "intermediate" | "advanced";
  roadmapContext?: {
    overview?: string;
    units?: Array<{ title: string; subpoints: string[] }>;
  };
  count?: number;
}) {
  const count = Math.max(3, Math.min(input.count ?? 5, 10));

  const contextUnits =
    input.roadmapContext?.units
      ?.slice(0, 10)
      .map((unit) => ({
        title: unit.title,
        subpoints: unit.subpoints.slice(0, 8),
      })) ?? [];

  const prompt = [
    "You are generating multiple-choice test questions for a learning app.",
    "Return ONLY valid JSON (no markdown).",
    "",
    "JSON shape:",
    "{",
    '  "skill": "kebab-case-skill",',
    '  "questions": [',
    '    { "id":"q1", "prompt":"...", "options":["A","B","C","D"], "answer_index":0, "explanation":"...", "unit_hint":"..." }',
    "  ]",
    "}",
    "",
    "Rules:",
    `- Generate exactly ${count} questions.`,
    "- Keep options plausible; only one correct.",
    "- Mix conceptual + applied questions from the context. Avoid trivia.",
    "- Keep explanations short and actionable.",
    "",
    `Skill: ${input.skill}`,
    input.difficultyBand ? `Difficulty: ${input.difficultyBand}` : "",
    "",
    "Roadmap context (RAG):",
    input.roadmapContext?.overview ? `Overview: ${input.roadmapContext.overview}` : "",
    JSON.stringify(contextUnits, null, 2),
  ]
    .filter(Boolean)
    .join("\n");

  const data = await generateJsonWithGemini(TestQuestionsResponseSchema, prompt, { temperature: 0.6 });

  // Safety clamp for answer_index within options.
  return {
    ...data,
    questions: data.questions.map((q, idx) => ({
      ...q,
      id: q.id || `q${idx + 1}`,
      answer_index: Math.max(0, Math.min(q.answer_index, q.options.length - 1)),
    })),
  };
}

