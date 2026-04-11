"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import type {
  BeginnerAnswerRequest,
  BeginnerQuestion,
  BeginnerStepResponse,
  BeginnerStartRequest,
} from "@/types/beginner-test";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseApiError(error: unknown): string {
  if (!isRecord(error)) return "Something went wrong.";
  const response = error.response;
  if (!isRecord(response)) return "Something went wrong.";
  const data = response.data;
  if (isRecord(data) && typeof data.detail === "string") return data.detail;
  if (typeof data === "string" && data.trim().length > 0) return data;
  return "Something went wrong while calling the API.";
}

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export default function BeginnerTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [startingError, setStartingError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [personalityScores, setPersonalityScores] = useState<Record<string, unknown>>({});
  const [question, setQuestion] = useState<BeginnerQuestion | null>(null);
  const [progressAsked, setProgressAsked] = useState(0);
  const [progressMin, setProgressMin] = useState(12);
  const [progressMax, setProgressMax] = useState(20);

  const [selectedOption, setSelectedOption] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [completedResult, setCompletedResult] = useState<BeginnerStepResponse | null>(null);

  const progressPct = useMemo(() => {
    if (progressMax <= 0) return 0;
    return Math.min(100, Math.round((progressAsked / progressMax) * 100));
  }, [progressAsked, progressMax]);

  const hydrateContext = useCallback((): {
    skill: string;
    scores: Record<string, unknown>;
  } => {
    const skillFromQuery = (searchParams.get("skill") || "").trim();
    const rawUser = localStorage.getItem("auth_user");

    let fromStorageSkill = "";
    let scores: Record<string, unknown> = {};
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (isRecord(parsed)) {
          if (typeof parsed.selected_skill === "string") {
            fromStorageSkill = parsed.selected_skill;
          }
          if (isRecord(parsed.personality_scores)) {
            scores = parsed.personality_scores;
          }
        }
      } catch {
        // Ignore malformed local state.
      }
    }

    return {
      skill: skillFromQuery || fromStorageSkill,
      scores,
    };
  }, [searchParams]);

  const applyStep = useCallback((step: BeginnerStepResponse) => {
    setSessionId(step.session_id || "");
    setSelectedSkill(step.selected_skill || "");
    setQuestion(step.question ?? null);
    setProgressAsked(step.progress?.asked ?? 0);
    setProgressMin(step.progress?.min_questions ?? 12);
    setProgressMax(step.progress?.max_questions ?? 20);

    setSelectedOption("");
    setTextAnswer("");
    setSubmitError(null);
  }, []);

  const persistCompletionAndNavigate = useCallback(
    async (result: BeginnerStepResponse) => {
      const finalScore = result.final_score ?? 0;
      const assignedLevel = result.assigned_level ?? "beginner";
      const skillSlug = result.selected_skill || selectedSkill;

      try {
        const { data } = await api.patch<{ token?: string }>("/api/auth/onboarding", {
          selected_skill: skillSlug,
          test_score: finalScore,
          level: assignedLevel,
          onboarding_complete: true,
        });
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
      } catch {
        // Continue with local state even if backend persistence fails.
      }

      const rawUser = localStorage.getItem("auth_user");
      let parsed: Record<string, unknown> = {};
      if (rawUser) {
        try {
          const obj = JSON.parse(rawUser);
          if (isRecord(obj)) {
            parsed = { ...obj };
          }
        } catch {
          parsed = {};
        }
      }

      parsed.selected_skill = skillSlug;
      parsed.test_score = finalScore;
      parsed.level = assignedLevel;
      parsed.onboarding_complete = true;
      parsed.personality_scores = result.personality_scores ?? personalityScores;
      parsed.beginner_test_result = result.roadmap_readiness_json ?? {};
      localStorage.setItem("auth_user", JSON.stringify(parsed));

      setTimeout(() => {
        router.push(`/roadmap/overview?skill=${encodeURIComponent(skillSlug)}`);
      }, 1400);
    },
    [personalityScores, router, selectedSkill]
  );

  useEffect(() => {
    let canceled = false;

    const startTest = async () => {
      setLoading(true);
      setStartingError(null);
      try {
        const { skill, scores } = hydrateContext();
        if (!skill) {
          throw new Error("No selected skill found. Please return to onboarding and choose a skill.");
        }

        setSelectedSkill(skill);
        setPersonalityScores(scores);

        const payload: BeginnerStartRequest = {
          selected_skill: skill,
          personality_scores: scores,
          min_questions: 12,
          max_questions: 20,
        };

        const { data } = await api.post<BeginnerStepResponse>("/api/beginner-test/start", payload);
        if (canceled) return;

        if (data.status === "test_complete") {
          setCompletedResult(data);
          await persistCompletionAndNavigate(data);
          return;
        }

        applyStep(data);
      } catch (error) {
        if (!canceled) {
          setStartingError(error instanceof Error ? error.message : parseApiError(error));
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    void startTest();
    return () => {
      canceled = true;
    };
  }, [applyStep, hydrateContext, persistCompletionAndNavigate]);

  const submitAnswer = async () => {
    if (!sessionId || !question) return;

    const finalAnswer =
      question.type === "mcq" ? selectedOption.trim() : textAnswer.trim();
    if (!finalAnswer) {
      setSubmitError("Please provide an answer before continuing.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: BeginnerAnswerRequest = {
        session_id: sessionId,
        answer: finalAnswer,
      };
      const { data } = await api.post<BeginnerStepResponse>("/api/beginner-test/answer", payload);

      if (data.status === "test_complete") {
        setCompletedResult(data);
        setQuestion(null);
        await persistCompletionAndNavigate(data);
        return;
      }

      applyStep(data);
    } catch (error) {
      setSubmitError(parseApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#080611] via-[#130b24] to-[#07050d] px-5 pb-20 pt-6 sm:px-8">
        <Navbar />
        <main className="mx-auto mt-10 w-full max-w-5xl">
          <div className="card-surface rounded-3xl border border-violet-300/20 bg-black/35 p-8 text-violet-100">
            Preparing your adaptive Beginner Test...
          </div>
        </main>
      </div>
    );
  }

  if (startingError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#080611] via-[#130b24] to-[#07050d] px-5 pb-20 pt-6 sm:px-8">
        <Navbar />
        <main className="mx-auto mt-10 w-full max-w-5xl">
          <div className="card-surface rounded-3xl border border-rose-300/35 bg-rose-950/20 p-8">
            <p className="text-sm text-rose-100">{startingError}</p>
            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="mt-4 rounded-xl border border-rose-200/40 px-4 py-2 text-xs text-rose-100 transition hover:border-rose-100/70"
            >
              Back to Onboarding
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080611] via-[#130b24] to-[#07050d] px-5 pb-20 pt-6 sm:px-8">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl pt-8">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="card-surface rounded-3xl border border-violet-300/20 bg-black/35 p-7 shadow-[0_0_80px_rgba(124,58,237,0.15)] backdrop-blur-xl sm:p-9"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-violet-200/70">Onboarding</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
                Beginner Test
              </h1>
              <p className="mt-2 text-sm text-violet-100/80">
                Domain: {titleCaseSlug(selectedSkill)}
              </p>
            </div>
            <div className="rounded-full border border-violet-300/30 bg-violet-500/10 px-4 py-2 text-xs text-violet-100">
              {completedResult ? "Completed" : `Question ${Math.max(1, progressAsked + 1)}`}
            </div>
          </div>

          {!completedResult ? (
            <>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs text-violet-200/80">
                  <span>
                    Progress {progressAsked}/{progressMax}
                  </span>
                  <span>Minimum target {progressMin}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-violet-950/70">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-400 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {question ? (
                <div className="mt-6 rounded-2xl border border-violet-300/20 bg-black/45 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-violet-300/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-violet-100">
                      {question.skill_area}
                    </span>
                    <span className="rounded-full border border-fuchsia-300/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-fuchsia-100">
                      {question.type}
                    </span>
                    <span className="rounded-full border border-indigo-300/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-indigo-100">
                      {question.difficulty}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-white">{question.question_text}</p>

                  {question.type === "mcq" ? (
                    <div className="mt-4 grid gap-2">
                      {question.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSelectedOption(option)}
                          className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                            selectedOption === option
                              ? "border-violet-200 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                              : "border-violet-300/25 bg-violet-900/10 text-violet-100 hover:border-violet-200/70"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <textarea
                        value={textAnswer}
                        onChange={(event) => setTextAnswer(event.target.value)}
                        rows={question.type === "coding" ? 10 : 6}
                        placeholder={
                          question.type === "coding"
                            ? "Write your code/thought process here..."
                            : "Write your answer here..."
                        }
                        className="w-full rounded-xl border border-violet-300/25 bg-black/55 px-4 py-3 font-mono text-xs text-violet-100 outline-none transition placeholder:text-violet-200/40 focus:border-violet-200/70"
                      />
                    </div>
                  )}

                  {question.explanation_for_adaptation ? (
                    <p className="mt-3 text-[11px] text-violet-200/65">
                      Adaptive note: {question.explanation_for_adaptation}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {submitError ? (
                <p className="mt-4 rounded-lg border border-rose-300/30 bg-rose-950/20 px-3 py-2 text-xs text-rose-200">
                  {submitError}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={submitting || !question}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Checking..." : "Submit & Next"}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-2xl border border-emerald-300/25 bg-emerald-950/20 p-6">
              <p className="text-xs uppercase tracking-[0.15em] text-emerald-100/80">
                Beginner Test Complete
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Score {completedResult.final_score ?? 0} | Level{" "}
                {String(completedResult.assigned_level ?? "beginner").toUpperCase()}
              </h2>
              <p className="mt-3 text-sm text-emerald-50/85">
                Finalizing your onboarding and redirecting to roadmap generation...
              </p>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
