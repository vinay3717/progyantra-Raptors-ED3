import type { DifficultyBand } from "@/types/roadmap";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  selected_skill?: string | null;
  test_score?: number | null;
  level?: DifficultyBand | null;
  onboarding_complete: boolean;
  total_points: number;
  streak_days: number;
}

export interface AuthPayload {
  user_id: string;
  email: string;
  name: string;
  selected_skill?: string | null;
  test_score?: number | null;
  level?: DifficultyBand | null;
  onboarding_complete: boolean;
  exp?: number;
}

export interface AuthResponse {
  token: string;
  user_id: string;
  onboarding_complete?: boolean;
  message?: string;
}
