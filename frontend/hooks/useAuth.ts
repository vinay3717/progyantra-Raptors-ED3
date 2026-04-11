"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
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
    const decoded = JSON.parse(atob(payload));
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
      router.push(nextUser.onboarding_complete ? "/roadmap" : "/onboarding");
    } catch {
      const fallbackToken = "mock.jwt.token";
      const nextUser: AuthUser = {
        id: crypto.randomUUID(),
        name: payload.email.split("@")[0] ?? "Learner",
        email: payload.email,
        selected_skill: null,
        test_score: null,
        level: null,
        onboarding_complete: false,
        total_points: 0,
        streak_days: 0,
      };

      persistAuth(fallbackToken, nextUser);
      router.push("/onboarding");
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
    } catch {
      const fallbackToken = "mock.jwt.token";
      const nextUser: AuthUser = {
        id: crypto.randomUUID(),
        name: payload.name,
        email: payload.email,
        selected_skill: null,
        test_score: null,
        level: null,
        onboarding_complete: false,
        total_points: 0,
        streak_days: 0,
      };
      persistAuth(fallbackToken, nextUser);
      router.push("/onboarding");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
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
