"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { AxiosError } from "axios";
import type { AuthPayload, AuthResponse, AuthUser } from "@/types/user";

type Credentials = {
  email: string;
  password: string;
};

type SignupPayload = Credentials & {
  name: string;
};

const AUTH_USER_KEY = "auth_user";
const AUTH_TOKEN_KEY = "token";

function decodeJwtPayload(token: string): AuthPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
    const decoded = JSON.parse(atob(padded));
    return decoded as AuthPayload;
  } catch {
    return null;
  }
}

function getUserFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  const detail = axiosError?.response?.data?.detail ?? axiosError?.response?.data?.message;
  if (typeof detail === "string" && detail.trim().length > 0) {
    return detail;
  }
  return fallback;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => getUserFromStorage());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(user && window.localStorage.getItem(AUTH_TOKEN_KEY));
  }, [user]);

  const persistAuth = (token: string, fallbackUser: AuthUser) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fallbackUser));
    setUser(fallbackUser);
  };

  const clearAuthState = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  };

  const login = async (payload: Credentials) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post<AuthResponse>("/api/auth/login", payload);
      const parsed = decodeJwtPayload(data.token);

      const nextUser: AuthUser = {
        id: data.user_id ?? parsed?.user_id ?? crypto.randomUUID(),
        name: parsed?.name ?? "Learner",
        email: parsed?.email ?? payload.email,
        selected_skill: parsed?.selected_skill ?? null,
        test_score: parsed?.test_score ?? null,
        level: parsed?.level ?? null,
        onboarding_complete: Boolean(
          data.onboarding_complete ?? parsed?.onboarding_complete
        ),
        total_points: 0,
        streak_days: 0,
      };

      persistAuth(data.token, nextUser);
      if (nextUser.onboarding_complete) {
        const skillQuery = nextUser.selected_skill
          ? `?skill=${encodeURIComponent(nextUser.selected_skill)}`
          : "";
        router.push(`/roadmap/overview${skillQuery}`);
      } else {
        router.push("/onboarding");
      }
    } catch (error) {
      clearAuthState();
      setError(getApiErrorMessage(error, "Unable to login. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload: SignupPayload) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post<AuthResponse>("/api/auth/register", payload);
      const parsed = decodeJwtPayload(data.token);
      const nextUser: AuthUser = {
        id: data.user_id ?? parsed?.user_id ?? crypto.randomUUID(),
        name: payload.name,
        email: payload.email,
        selected_skill: parsed?.selected_skill ?? null,
        test_score: parsed?.test_score ?? null,
        level: parsed?.level ?? null,
        onboarding_complete: false,
        total_points: 0,
        streak_days: 0,
      };

      persistAuth(data.token, nextUser);
      router.push("/onboarding");
    } catch (error) {
      clearAuthState();
      setError(getApiErrorMessage(error, "Unable to create account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthState();
    router.push("/auth");
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
  };
}
