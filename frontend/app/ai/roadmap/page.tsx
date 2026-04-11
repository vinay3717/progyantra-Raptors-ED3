"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GhostLoaders from "@/components/roadmap/GhostLoaders";

type RoadmapData = {
  skill: string;
  difficulty_band: "beginner" | "intermediate" | "advanced";
  overview: {
    description: string;
    career_impact: string;
    program_outcomes: string[];
    syllabus_summary: string[];
  };
  units: Array<{
    id: string;
    title: string;
    order_index: number;
    unit_score: number;
    is_locked: boolean;
    subpoints: Array<{
      id: string;
      title: string;
      status: "not_started" | "in_progress" | "completed";
      assessment_type: "quiz" | "task" | "project" | "none";
      points_value: number;
      practice_url?: string;
      learning_resource_url?: string;
    }>;
  }>;
  graph: {
    nodes: Array<{ id: string; label: string; x: number; y: number; type: string; status: string }>;
    edges: Array<{ from: string; to: string }>;
  };
};

function kebab(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function AiRoadmapPage() {
  const router = useRouter();
  const [targetSkill, setTargetSkill] = useState("web-development");
  const [difficultyBand, setDifficultyBand] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [resumeText, setResumeText] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("auth_user");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { selected_skill?: string | null };
      if (parsed.selected_skill) setTargetSkill(kebab(parsed.selected_skill));
    } catch {
      // ignore
    }
  }, []);

  const storageKey = useMemo(() => (roadmap ? `ai_roadmap:${roadmap.skill}` : null), [roadmap]);

  const persistRoadmapOverride = (nextRoadmap: RoadmapData) => {
    const skillSlug = nextRoadmap.skill;
    // Save under both the returned skill and the current requested skill to avoid mismatches.
    window.localStorage.setItem(`ai_roadmap:${skillSlug}`, JSON.stringify(nextRoadmap));
    window.localStorage.setItem(`ai_roadmap:${targetSkill}`, JSON.stringify(nextRoadmap));
    window.localStorage.setItem("ai_roadmap:last", JSON.stringify({ skill: skillSlug, roadmap: nextRoadmap }));

    // Keep auth_user aligned so the rest of the app uses the same skill by default.
    const rawUser = window.localStorage.getItem("auth_user");
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser) as { selected_skill?: string | null };
        parsed.selected_skill = skillSlug;
        window.localStorage.setItem("auth_user", JSON.stringify(parsed));
      } catch {
        // ignore
      }
    }
  };

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
          <p className="text-xs tracking-[0.24em] text-white/55 uppercase">Roadmap Generator</p>
          <h1 className="mt-2 font-display text-5xl tracking-tighter text-white sm:text-6xl">
            Resume-Based Path Builder
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-white/68">
            Generates a roadmap JSON that matches the app schema and can be loaded into `/roadmap`.
          </p>
        </motion.section>

        <section className="grid gap-4 lg:grid-cols-[0.55fr_0.45fr]">
          <article className="rounded-[2rem] border border-white/12 bg-black/45 p-6 backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs tracking-[0.14em] text-white/55 uppercase">Target Skill</span>
                <input
                  value={targetSkill}
                  onChange={(e) => setTargetSkill(kebab(e.target.value))}
                  className="auth-input"
                  placeholder="web-development"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs tracking-[0.14em] text-white/55 uppercase">Difficulty</span>
                <select
                  value={difficultyBand}
                  onChange={(e) => setDifficultyBand(e.target.value as typeof difficultyBand)}
                  className="auth-input"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className="text-xs tracking-[0.14em] text-white/55 uppercase">Resume Text</span>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-52 w-full rounded-2xl border border-white/15 bg-black/45 p-4 text-sm text-white outline-none transition focus:border-white/35"
                placeholder="Paste resume text here (skills, projects, experience)..."
              />
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-xs tracking-[0.14em] text-white/55 uppercase">Notes (Optional)</span>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="min-h-24 w-full rounded-2xl border border-white/15 bg-black/45 p-4 text-sm text-white outline-none transition focus:border-white/35"
                placeholder="Goal role, timeline, weak areas, preferred stack..."
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading || resumeText.trim().length < 80}
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  setRoadmap(null);
                  setSaved(false);
                  try {
                    const res = await fetch("/api/ai/roadmap", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({
                        targetSkill,
                        difficultyBand,
                        resumeText,
                        userNotes,
                      }),
                    });
                    const data = (await res.json()) as { roadmap?: RoadmapData; error?: string };
                    if (!res.ok) throw new Error(data.error ?? `Failed to generate roadmap (HTTP ${res.status})`);
                    if (!data.roadmap) throw new Error("No roadmap returned from AI route.");

                    // Persist immediately so /roadmap loads the new path without extra clicks.
                    persistRoadmapOverride(data.roadmap);
                    setSaved(true);
                    setRoadmap(data.roadmap);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Unknown error");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="button-shimmer rounded-full px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Roadmap"}
              </button>
              <Link
                href="/roadmap/overview"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/85 transition hover:border-white/40"
              >
                Open Roadmap
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

            <p className="mt-4 text-xs text-white/55">
              Tip: Add your real Gemini key to `.env.local` as `GEMINI_API_KEY`.
            </p>
          </article>

          <article className="rounded-[2rem] border border-white/12 bg-black/45 p-6 backdrop-blur-xl">
            <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Preview</p>
            {roadmap ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Skill</p>
                  <p className="mt-2 font-display text-2xl tracking-tight text-white">
                    {roadmap.skill.replace(/-/g, " ")}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/70">{roadmap.overview.description}</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Units</p>
                  <ul className="mt-3 space-y-2 text-sm text-white/80">
                    {roadmap.units.slice(0, 6).map((unit) => (
                      <li key={unit.id}>
                        {unit.order_index}. {unit.title} ({unit.subpoints.length} subpoints)
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      persistRoadmapOverride(roadmap);
                      setSaved(true);
                      router.push(`/roadmap/overview?skill=${encodeURIComponent(roadmap.skill)}`);
                    }}
                    className="rounded-full border border-cyan-200/35 bg-cyan-200/12 px-5 py-2.5 text-sm text-cyan-100 transition hover:bg-cyan-200/20"
                  >
                    Open Updated Roadmap
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!storageKey) return;
                      window.localStorage.removeItem(storageKey);
                      window.localStorage.removeItem(`ai_roadmap:${targetSkill}`);
                      window.localStorage.removeItem("ai_roadmap:last");
                      setRoadmap(null);
                      setSaved(false);
                    }}
                    className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/85 transition hover:border-white/40"
                  >
                    Clear Preview
                  </button>
                </div>

                {saved ? (
                  <p className="text-xs text-cyan-200">
                    Saved. `/roadmap` will now load this generated path for `{roadmap.skill}`.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-white/65">
                Generate a roadmap to preview it here, then load it into `/roadmap`.
              </p>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
