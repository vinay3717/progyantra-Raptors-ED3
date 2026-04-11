"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { AlertTriangle, ArrowRight, Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FeaturePlaceholder from "@/components/FeaturePlaceholder";
import GhostLoaders from "@/components/roadmap/GhostLoaders";
import { useRoadmapRuntime } from "@/components/roadmap/RoadmapRuntimeProvider";

const assessmentBank = {
  quiz: {
    prompt: "What is the best next action to validate this concept quickly?",
    options: [
      "Write a mini example and test one edge case",
      "Skip to the next module immediately",
      "Memorize definitions without applying them",
      "Ignore the current milestone and switch domain",
    ],
    correctIndex: 0,
  },
  task: {
    prompt: "Which deliverable is most aligned with a task checkpoint?",
    options: [
      "A short implementation with notes and outcome",
      "Only a screenshot with no explanation",
      "A random tutorial summary",
      "No deliverable is required",
    ],
    correctIndex: 0,
  },
  project: {
    prompt: "For project milestones, what indicates completion quality?",
    options: [
      "Clear objective, working output, and reflection",
      "Only code length regardless of outcome",
      "Finishing in the fewest lines possible",
      "Marking complete before implementation",
    ],
    correctIndex: 0,
  },
  none: {
    prompt: "How should you handle a reading-only checkpoint?",
    options: [
      "Summarize key takeaways and one actionable step",
      "Skip the material entirely",
      "Mark complete without reviewing",
      "Repeat previous tasks instead",
    ],
    correctIndex: 0,
  },
} as const;

type FeedbackState = "idle" | "correct" | "incorrect";

export default function RoadmapStudyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    roadmap,
    loading,
    timeline,
    activeUnitId,
    setActiveUnitId,
    failCount,
    registerAttempt,
    resetFailCount,
    completeNextTask,
  } = useRoadmapRuntime();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");

  const activeUnit = useMemo(() => {
    if (!roadmap?.units.length) return null;
    return roadmap.units.find((unit) => unit.id === activeUnitId) ?? roadmap.units[0];
  }, [activeUnitId, roadmap]);

  const activeSubpoint = useMemo(
    () => activeUnit?.subpoints.find((subpoint) => subpoint.status !== "completed") ?? null,
    [activeUnit]
  );

  const assessment = useMemo(() => {
    if (!activeSubpoint) return null;
    return assessmentBank[activeSubpoint.assessment_type] ?? assessmentBank.none;
  }, [activeSubpoint]);

  const lessonMarkdown = useMemo(() => {
    if (!activeUnit || !activeSubpoint) {
      return `## Review Mode\n\nAll current milestones are complete. Move to the graph tab to inspect upcoming route expansions.`;
    }

    const focusTags = activeUnit.subpoints
      .slice(0, 4)
      .map((item) => `- ${item.title}`)
      .join("\n");

    return `## ${activeUnit.title}\n\n### Focus Milestone\n**${activeSubpoint.title}**\n\n### Why This Matters\nThis checkpoint is part of your adaptive path. Finishing it unlocks the next wave segment and improves your roadmap trajectory.\n\n### Quick Focus Checklist\n${focusTags}\n\n### Study Rhythm\n- Spend 20 minutes understanding the concept\n- Build a mini output or verification snippet\n- Answer the assessment terminal on the right`;
  }, [activeSubpoint, activeUnit]);

  useEffect(() => {
    if (failCount < 3) return;

    const skill = searchParams.get("skill");
    const query = skill ? `?skill=${encodeURIComponent(skill)}&reroute=true` : "?reroute=true";

    const timeout = setTimeout(() => {
      router.push(`/roadmap/graph${query}`);
      resetFailCount();
    }, 1100);

    return () => clearTimeout(timeout);
  }, [failCount, resetFailCount, router, searchParams]);

  if (loading) {
    return <GhostLoaders lines={4} className="pt-4" />;
  }

  if (!roadmap) {
    return (
      <FeaturePlaceholder
        title="Study Module In Orbit"
        description="Learning content and assessment terminal will appear here once roadmap payloads are available."
      />
    );
  }

  const rerouteGlow = failCount >= 2;

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <p className="text-xs tracking-[0.24em] text-white/55 uppercase">Study</p>
        <h2 className="font-display text-5xl tracking-tighter text-white sm:text-6xl">
          Focus Mode Interface
        </h2>
        <p className="max-w-3xl text-sm leading-8 text-white/68 sm:text-base">
          Left column keeps the learning material clean and high-contrast. Right
          column runs one active assessment at a time.
        </p>
      </header>

      <div
        className={`grid gap-6 lg:grid-cols-[1.2fr_0.8fr] ${
          rerouteGlow ? "study-reroute-glow rounded-[2.2rem] border border-orange-300/35 p-4" : ""
        }`}
      >
        <article className="rounded-[2rem] border border-white/12 bg-black/45 p-6 backdrop-blur-xl sm:p-8">
          <div className="markdown-body">
            <ReactMarkdown>{lessonMarkdown}</ReactMarkdown>
          </div>
        </article>

        <aside className="space-y-4">
          <motion.section
            animate={{ y: [-5, 5] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "mirror", duration: 7 }}
            className={`rounded-[2rem] border p-5 backdrop-blur-xl ${
              rerouteGlow
                ? "border-orange-300/35 bg-orange-500/[0.08]"
                : "border-white/12 bg-black/45"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs tracking-[0.18em] text-white/55 uppercase">Assessment Terminal</p>
              <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/70">
                Fail Count {failCount}/3
              </span>
            </div>

            {activeSubpoint && assessment ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-white">{activeSubpoint.title}</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">{assessment.prompt}</p>
                </div>

                <div className="space-y-2">
                  {assessment.options.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedOption(index)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                        selectedOption === index
                          ? "border-cyan-100 bg-cyan-200/10 text-white"
                          : "border-white/12 bg-black/45 text-white/72 hover:border-white/35 hover:text-white"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={selectedOption === null}
                    onClick={async () => {
                      if (selectedOption === null) return;
                      const isCorrect = selectedOption === assessment.correctIndex;

                      registerAttempt(isCorrect);
                      setFeedback(isCorrect ? "correct" : "incorrect");

                      if (isCorrect && activeUnit) {
                        await completeNextTask(activeUnit.id);
                        setSelectedOption(null);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-200/35 bg-cyan-200/12 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-200/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/35"
                  >
                    Submit
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOption(null);
                      setFeedback("idle");
                    }}
                    className="rounded-full border border-white/18 px-4 py-2 text-sm text-white/75 transition hover:border-white/35 hover:text-white"
                  >
                    Reset
                  </button>
                </div>

                {feedback === "correct" ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200/30 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">
                    <Check className="h-4 w-4" />
                    Great response. Path signal moved to the next segment.
                  </div>
                ) : null}

                {feedback === "incorrect" ? (
                  <div className="flex items-center gap-2 rounded-xl border border-orange-200/35 bg-orange-300/10 px-3 py-2 text-xs text-orange-100">
                    <X className="h-4 w-4" />
                    Incorrect attempt. Three failures trigger an automatic reroute.
                  </div>
                ) : null}
              </div>
            ) : (
              <FeaturePlaceholder
                title="All Tasks Completed"
                description="You are currently done with all listed subpoints. Switch to graph and generate next milestones."
                actionLabel="Open Graph"
                onNotify={() => {
                  const skill = searchParams.get("skill");
                  const query = skill ? `?skill=${encodeURIComponent(skill)}` : "";
                  router.push(`/roadmap/graph${query}`);
                }}
                className="p-4"
              />
            )}
          </motion.section>

          <section className="rounded-3xl border border-white/12 bg-black/45 p-5">
            <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Milestone Queue</p>
            <div className="mt-3 space-y-2">
              {timeline.slice(0, 4).map((item) => (
                <button
                  key={item.unitId}
                  type="button"
                  onClick={() => setActiveUnitId(item.unitId)}
                  className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-white/25"
                >
                  <p className="text-sm text-white">{item.title}</p>
                  <p className="text-xs text-white/55">{item.note}</p>
                </button>
              ))}

              {failCount >= 3 ? (
                <motion.article
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-orange-300/35 bg-orange-500/[0.06] px-3 py-2"
                >
                  <p className="text-sm text-orange-100">Recovery Node Added</p>
                  <p className="text-xs text-orange-100/80">
                    Redirecting to graph reroute flow...
                  </p>
                </motion.article>
              ) : null}
            </div>
          </section>

          {failCount >= 3 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-2xl border border-orange-300/35 bg-orange-500/[0.08] px-4 py-3 text-xs text-orange-100"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              Reroute engaged. We are opening the graph to reshape your path.
            </motion.div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
