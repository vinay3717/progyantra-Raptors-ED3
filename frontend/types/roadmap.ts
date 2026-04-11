export type DifficultyBand = "beginner" | "intermediate" | "advanced";

export type AssessmentType = "quiz" | "task" | "project" | "none";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type GraphNodeType = "start" | "topic" | "assessment" | "end";

export type GraphNodeStatus = "locked" | "active" | "completed";

export interface SubPoint {
  id: string;
  title: string;
  status: ProgressStatus;
  practice_url?: string;
  learning_resource_url?: string;
  assessment_type: AssessmentType;
  points_value: number;
}

export interface Unit {
  id: string;
  title: string;
  order_index: number;
  unit_score: number;
  is_locked: boolean;
  user_unit_progress?: string;
  subpoints: SubPoint[];
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: GraphNodeType;
  status: GraphNodeStatus;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface RoadmapOverview {
  description: string;
  career_impact: string;
  program_outcomes: string[];
  syllabus_summary: string[];
}

export interface ScoreBreakdown {
  total_score: number;
  user_score: number;
  tier: string;
  unit_scores: Array<{ unit_id: string; title: string; score: number }>;
}

export interface RoadmapData {
  skill: string;
  difficulty_band: DifficultyBand;
  user_score: number;
  total_score: number;
  score_tier: string;
  overview: RoadmapOverview;
  units: Unit[];
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}
