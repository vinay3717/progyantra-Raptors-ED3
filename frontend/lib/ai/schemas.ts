import { z } from "zod";

export const DifficultyBandSchema = z.enum(["beginner", "intermediate", "advanced"]);
export const AssessmentTypeSchema = z.enum(["quiz", "task", "project", "none"]);
export const ProgressStatusSchema = z.enum(["not_started", "in_progress", "completed"]);
export const GraphNodeStatusSchema = z.enum(["locked", "active", "completed"]);

export const SubPointSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    status: ProgressStatusSchema.optional().default("not_started"),
    practice_url: z.string().url().optional(),
    learning_resource_url: z.string().url().optional(),
    assessment_type: AssessmentTypeSchema.optional().default("none"),
    points_value: z.number().optional().default(10),
  })
  .strict();

export const UnitSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    order_index: z.number().optional().default(1),
    unit_score: z.number().optional().default(20),
    is_locked: z.boolean().optional().default(false),
    user_unit_progress: z.string().optional(),
    subpoints: z.array(SubPointSchema).default([]),
  })
  .strict();

export const RoadmapOverviewSchema = z
  .object({
    description: z.string(),
    career_impact: z.string(),
    program_outcomes: z.array(z.string()).default([]),
    syllabus_summary: z.array(z.string()).default([]),
  })
  .strict();

export const GraphNodeSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    x: z.number().optional(),
    y: z.number().optional(),
    type: z.enum(["start", "topic", "assessment", "end"]).optional().default("topic"),
    status: GraphNodeStatusSchema.optional().default("active"),
  })
  .strict();

export const GraphEdgeSchema = z
  .object({
    from: z.string(),
    to: z.string(),
  })
  .strict();

export const RoadmapDataSchema = z
  .object({
    skill: z.string(),
    difficulty_band: DifficultyBandSchema,
    user_score: z.number().optional().default(0),
    total_score: z.number().optional().default(100),
    score_tier: z.string().optional().default("52+"),
    overview: RoadmapOverviewSchema,
    units: z.array(UnitSchema).default([]),
    graph: z
      .object({
        nodes: z.array(GraphNodeSchema).default([]),
        edges: z.array(GraphEdgeSchema).default([]),
      })
      .optional(),
  })
  .strict();

export const AssessmentOverviewSchema = z
  .object({
    headline: z.string(),
    score_summary: z.string(),
    strengths: z.array(z.string()).default([]),
    gaps: z.array(z.string()).default([]),
    recommended_focus: z.array(z.string()).default([]),
    reroute: z.boolean().optional().default(false),
    injected_nodes: z.array(z.string()).optional().default([]),
  })
  .strict();

export const PathSuggestionSchema = z
  .object({
    title: z.string(),
    target_skill: z.string(),
    difficulty_band: DifficultyBandSchema,
    rationale: z.string(),
    first_week_plan: z.array(z.string()).default([]),
  })
  .strict();

export const SuggestionsResponseSchema = z
  .object({
    suggestions: z.array(PathSuggestionSchema).default([]),
  })
  .strict();

export const TestQuestionSchema = z
  .object({
    id: z.string(),
    prompt: z.string(),
    options: z.array(z.string()).min(2).max(6),
    answer_index: z.number().int().min(0).max(5),
    explanation: z.string(),
    unit_hint: z.string().optional(),
  })
  .strict();

export const TestQuestionsResponseSchema = z
  .object({
    skill: z.string(),
    questions: z.array(TestQuestionSchema).min(3).max(12),
  })
  .strict();
