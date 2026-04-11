"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import FeaturePlaceholder from "@/components/FeaturePlaceholder";
import Link from "next/link";
import GhostLoaders from "@/components/roadmap/GhostLoaders";

type StoredTestResult = {
  skill?: string;
  score: number;
  total: number;
  wrongQuestions: Array<{ prompt: string; chosen: string; correct: string }>;
};

type AssessmentOverview = {
  headline: string;
  score_summary: string;
  strengths: string[];
  gaps: string[];
  recommended_focus: string[];
  reroute: boolean;
  injected_nodes: string[];
};

export default function AiAssessmentPage() {
  const [stored, setStored] = useState<StoredTestResult | null>(null);
  const [skill, setSkill] = useState("web-development");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AssessmentOverview | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("test_last_result");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as StoredTestResult;
      setStored(parsed);
      setSkill(parsed.skill ?? "web-development");
    } catch {
      // ignore
    }
  }, []);

  const payload = useMemo(() => {
    if (!stored) return null;
    return {
      skill,
      score: stored.score,
      total: stored.total,
      wrongQuestions: stored.wrongQuestions ?? [],
    };
  }, [skill, stored]);

  if (!stored) {
    return (
      <div className="min-h-screen bg-black px-[6vw] pb-20 pt-6 text-white">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl pt-8">
          <FeaturePlaceholder
            title="No Test Result Found"
            description="Run the /test page once to store an assessment result, then come back here for the AI overview."
            actionLabel="Open Test"
            onNotify={() => (window.location.href = "/test")}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-[6vw] pb-20 pt-6 text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl space-y-6 pt-8">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="rounded-[2rem] border border-white/12 bg-black/45 p-7 backdrop-blur-xl"
        >
          <p className="text-xs tracking-[0.24em] text-white/55 uppercase">Assessment Overview</p>
          <h1 className="mt-2 font-display text-5xl tracking-tighter text-white sm:text-6xl">
            AI Score Debrief
          </h1>
          <p className="mt-3 text-sm text-white/68">
            Stored result: {stored.score}/{stored.total}. Wrong answers: {stored.wrongQuestions.length}.
          </p>
        </motion.section>

        <section className="grid gap-4 lg:grid-cols-[0.6fr_0.4fr]">
          <article className="rounded-[2rem] border border-white/12 bg-black/45 p-6 backdrop-blur-xl">
            <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Inputs</p>
            <label className="mt-4 block space-y-2">
              <span className="text-xs tracking-[0.14em] text-white/55 uppercase">Skill</span>
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="auth-input"
                placeholder="web-development"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading || !payload}
                onClick={async () => {
                  if (!payload) return;
                  setLoading(true);
                  setError(null);
                  setOverview(null);
                  try {
                    const res = await fetch("/api/ai/assessment", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    const data = (await res.json()) as { overview?: AssessmentOverview; error?: string };
                    if (!res.ok) {
                      throw new Error(data.error ?? `Failed to generate overview (HTTP ${res.status})`);
                    }
                    setOverview(data.overview ?? null);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Unknown error");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="button-shimmer rounded-full px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Overview"}
              </button>
              <Link
                href="/test"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/85 transition hover:border-white/40"
              >
                Run Test Again
              </Link>
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-orange-300/25 bg-orange-400/5 px-4 py-2 text-xs text-orange-200">
                {error}
              </p>
            ) : null}

            {loading ? (
              <div className="mt-4">
                <GhostLoaders lines={2} />
              </div>
            ) : null}
          </article>

          <article className="rounded-[2rem] border border-white/12 bg-black/45 p-6 backdrop-blur-xl">
            <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Wrong Questions</p>
            <div className="mt-4 space-y-3">
              {stored.wrongQuestions.length ? (
                stored.wrongQuestions.slice(0, 6).map((q, idx) => (
                  <div key={`${q.prompt}-${idx}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-white">{q.prompt}</p>
                    <p className="mt-2 text-xs text-white/60">Chosen: {q.chosen}</p>
                    <p className="text-xs text-white/60">Correct: {q.correct}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/65">No wrong answers recorded.</p>
              )}
            </div>
          </article>
        </section>

        {overview ? (
          <section className="rounded-[2rem] border border-white/12 bg-black/45 p-7 backdrop-blur-xl">
            <h2 className="font-display text-3xl tracking-tight text-white">{overview.headline}</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">{overview.score_summary}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Strengths</p>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  {overview.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Gaps</p>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  {overview.gaps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Next Focus</p>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  {overview.recommended_focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {overview.reroute ? (
              <div className="mt-6 rounded-3xl border border-orange-300/35 bg-orange-500/[0.06] p-5">
                <p className="text-xs tracking-[0.16em] text-orange-200/80 uppercase">Reroute Trigger</p>
                <p className="mt-2 text-sm text-orange-100/90">
                  Suggested injected nodes: {overview.injected_nodes.join(", ") || "None"}
                </p>
                <Link
                  href="/roadmap/graph?reroute=true"
                  className="mt-4 inline-flex rounded-full border border-orange-200/35 px-4 py-2 text-sm text-orange-50 transition hover:bg-orange-400/10"
                >
                  Open Reroute Graph
                </Link>
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}
