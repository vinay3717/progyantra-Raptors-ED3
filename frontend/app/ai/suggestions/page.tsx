"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import GhostLoaders from "@/components/roadmap/GhostLoaders";

type Suggestion = {
  title: string;
  target_skill: string;
  difficulty_band: "beginner" | "intermediate" | "advanced";
  rationale: string;
  first_week_plan: string[];
};

export default function AiSuggestionsPage() {
  const [goal, setGoal] = useState("Get job-ready in 8 weeks");
  const [currentSkill, setCurrentSkill] = useState("web-development");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  return (
    <div className="min-h-screen bg-black px-[6vw] pb-20 pt-6 text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl space-y-6 pt-8">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="rounded-[2rem] border border-white/12 bg-black/45 p-7 backdrop-blur-xl"
        >
          <p className="text-xs tracking-[0.24em] text-white/55 uppercase">Path Suggestions</p>
          <h1 className="mt-2 font-display text-5xl tracking-tighter text-white sm:text-6xl">
            Choose a Dynamic Track
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-white/68">
            Generates multiple candidate paths from your resume and goal, then you can generate a full roadmap.
          </p>
        </motion.section>

        <section className="grid gap-4 lg:grid-cols-[0.55fr_0.45fr]">
          <article className="rounded-[2rem] border border-white/12 bg-black/45 p-6 backdrop-blur-xl">
            <label className="block space-y-2">
              <span className="text-xs tracking-[0.14em] text-white/55 uppercase">Goal</span>
              <input value={goal} onChange={(e) => setGoal(e.target.value)} className="auth-input" />
            </label>
            <label className="mt-4 block space-y-2">
              <span className="text-xs tracking-[0.14em] text-white/55 uppercase">Current Skill (Optional)</span>
              <input
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                className="auth-input"
              />
            </label>
            <label className="mt-4 block space-y-2">
              <span className="text-xs tracking-[0.14em] text-white/55 uppercase">Resume Text</span>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-60 w-full rounded-2xl border border-white/15 bg-black/45 p-4 text-sm text-white outline-none transition focus:border-white/35"
                placeholder="Paste resume text..."
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading || resumeText.trim().length < 80}
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  setSuggestions([]);
                  try {
                    const res = await fetch("/api/ai/suggestions", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ resumeText, goal, currentSkill }),
                    });
                    const data = (await res.json()) as { suggestions?: Suggestion[]; error?: string };
                    if (!res.ok) {
                      throw new Error(data.error ?? `Failed to generate suggestions (HTTP ${res.status})`);
                    }
                    setSuggestions(data.suggestions ?? []);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Unknown error");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="button-shimmer rounded-full px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Suggestions"}
              </button>
              <Link
                href="/ai/roadmap"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/85 transition hover:border-white/40"
              >
                Open Roadmap Generator
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
            <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Suggestions</p>
            <div className="mt-4 space-y-4">
              {suggestions.length ? (
                suggestions.map((suggestion) => (
                  <div
                    key={`${suggestion.title}-${suggestion.target_skill}`}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <p className="text-xs tracking-[0.16em] text-white/55 uppercase">
                      {suggestion.difficulty_band}
                    </p>
                    <h2 className="mt-2 font-display text-2xl tracking-tight text-white">
                      {suggestion.title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-white/70">{suggestion.rationale}</p>
                    <ul className="mt-3 space-y-1 text-sm text-white/75">
                      {suggestion.first_week_plan.slice(0, 6).map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                    <Link
                      href="/ai/roadmap"
                      className="mt-4 inline-flex rounded-full border border-cyan-200/35 bg-cyan-200/12 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-200/20"
                    >
                      Generate Full Roadmap
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/65">Generate suggestions to see options here.</p>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
