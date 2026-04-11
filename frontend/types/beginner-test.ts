export type BeginnerQuestionType = "mcq" | "coding" | "scenario" | "short_answer";
export type BeginnerLevel = "beginner" | "intermediate" | "advanced";
export type BeginnerStatus = "next_question" | "test_complete";

export interface BeginnerQuestion {
  question_id: number;
  skill_area: string;
  question_text: string;
  type: BeginnerQuestionType;
  options: string[];
  difficulty: BeginnerLevel;
  explanation_for_adaptation?: string | null;
}

export interface BeginnerProgress {
  asked: number;
  min_questions: number;
  max_questions: number;
}

export interface BeginnerStepResponse {
  session_id: string;
  status: BeginnerStatus;
  selected_skill: string;
  question?: BeginnerQuestion | null;
  progress?: BeginnerProgress | null;
  final_score?: number | null;
  assigned_level?: BeginnerLevel | null;
  personality_scores?: Record<string, unknown> | null;
  roadmap_readiness_json?: Record<string, unknown> | null;
}

export interface BeginnerStartRequest {
  selected_skill: string;
  personality_scores?: Record<string, unknown> | null;
  min_questions?: number;
  max_questions?: number;
}

export interface BeginnerAnswerRequest {
  session_id: string;
  answer: string;
}
