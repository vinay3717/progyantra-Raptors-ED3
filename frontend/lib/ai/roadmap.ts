import { RoadmapDataSchema } from "./schemas";
import { generateJsonWithGemini } from "./gemini";

function ensureGraph(data: unknown) {
  const parsed = RoadmapDataSchema.parse(data);
  const units = parsed.units ?? [];

  const nodes =
    parsed.graph?.nodes?.length && parsed.graph.nodes.length >= units.length
      ? parsed.graph.nodes
      : units.map((unit, index) => ({
          id: unit.id,
          label: unit.title,
          x: 90 + index * 200,
          y: 170 + Math.sin(index * 1.15) * 70,
          type: index === 0 ? "start" : index === units.length - 1 ? "end" : "topic",
          status: unit.is_locked ? "locked" : "active",
        }));

  const edges =
    parsed.graph?.edges?.length
      ? parsed.graph.edges
      : units.slice(1).map((unit, index) => ({
          from: units[index].id,
          to: unit.id,
        }));

  return {
    ...parsed,
    units: units.map((unit, index) => ({
      ...unit,
      order_index: unit.order_index ?? index + 1,
      unit_score: unit.unit_score ?? 20,
      subpoints: (unit.subpoints ?? []).map((subpoint, spIndex) => ({
        ...subpoint,
        points_value: subpoint.points_value ?? 10,
        id: subpoint.id || `${unit.id}-sp-${spIndex + 1}`,
      })),
    })),
    graph: { nodes, edges },
  };
}

export async function generateRoadmapFromResume(input: {
  targetSkill: string;
  difficultyBand: "beginner" | "intermediate" | "advanced";
  resumeText: string;
  userNotes?: string;
}) {
  const resume = input.resumeText.trim().slice(0, 12000);
  const notes = (input.userNotes ?? "").trim().slice(0, 4000);
  const prompt = [
    "You are generating a learning roadmap JSON for a web app.",
    "Return ONLY valid JSON (no markdown, no commentary).",
    "",
    "Output must match this shape:",
    "{",
    '  "skill": "kebab-case-skill",',
    '  "difficulty_band": "beginner|intermediate|advanced",',
    '  "overview": { "description": "...", "career_impact": "...", "program_outcomes": ["..."], "syllabus_summary": ["..."] },',
    '  "units": [',
    '    { "id": "u1", "title": "...", "order_index": 1, "unit_score": 20, "is_locked": false, "subpoints": [',
    '      { "id": "sp1", "title": "...", "status": "not_started", "assessment_type": "quiz|task|project|none", "points_value": 10, "practice_url": "https://...", "learning_resource_url": "https://..." }',
    "    ] }",
    "  ],",
    '  "graph": { "nodes": [{ "id":"u1","label":"...","x":100,"y":160,"type":"start|topic|assessment|end","status":"locked|active|completed" }], "edges":[{"from":"u1","to":"u2"}] }',
    "}",
    "",
    "Rules:",
    "- Keep the UI zero-clutter: units must have short titles and 3-6 subpoints each.",
    "- Make units sequential dependencies unless resume suggests a fast-track (still keep edges linear).",
    "- Include real URLs when possible (MDN, official docs).",
    "- Use kebab-case for skill slug.",
    "",
    `Target skill: ${input.targetSkill}`,
    `Difficulty band: ${input.difficultyBand}`,
    notes ? `User notes: ${notes}` : "",
    "",
    "Resume text:",
    resume,
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await generateJsonWithGemini(RoadmapDataSchema, prompt, { temperature: 0.25 });
  return ensureGraph(raw);
}

