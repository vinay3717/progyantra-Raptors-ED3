"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTimer } from "react-timer-hook";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import type { DifficultyBand } from "@/types/roadmap";

type QuizQuestion = {
  id: string;
  text: string;
  options: string[];
  correct: number;
};

const jobMarket = [
  {
    role: "Frontend Developer",
    salary: "INR 6L - 16L",
    demand: "High",
    skills: ["HTML", "CSS", "React"],
  },
  {
    role: "Data Analyst",
    salary: "INR 5L - 14L",
    demand: "High",
    skills: ["SQL", "Python", "BI"],
  },
  {
    role: "ML Engineer",
    salary: "INR 10L - 28L",
    demand: "High",
    skills: ["Python", "MLOps", "Deep Learning"],
  },
];

const skills = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "AI/ML",
  "Cybersecurity",
  "Cloud & DevOps",
  "Blockchain",
  "UI/UX Design",
];

const questions: QuizQuestion[] = [
  {
    id: "q1",
    text: "Which HTML tag is used for the largest heading?",
    options: ["<h1>", "<header>", "<head>", "<h6>"],
    correct: 0,
  },
  {
    id: "q2",
    text: "Which CSS property controls spacing inside an element?",
    options: ["margin", "padding", "gap", "border-spacing"],
    correct: 1,
  },
  {
    id: "q3",
    text: "Which statement defines a variable in modern JavaScript?",
    options: ["var", "let", "const", "Both let and const"],
    correct: 3,
  },
  {
    id: "q4",
    text: "What does React primarily use to render lists efficiently?",
    options: ["IDs in CSS", "Keys", "Refs", "Memo"],
    correct: 1,
  },
  {
    id: "q5",
    text: "HTTP status 200 indicates:",
    options: ["Redirect", "Unauthorized", "Success", "Server Error"],
    correct: 2,
  },
];

function levelFromScore(score: number): DifficultyBand {
  if (score <= 40) return "beginner";
  if (score <= 75) return "intermediate";
  return "advanced";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [assignedLevel, setAssignedLevel] = useState<DifficultyBand | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const expiryTimestamp = useMemo(() => {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 20);
    return expiry;
  }, []);

  const { minutes, seconds, restart } = useTimer({
    expiryTimestamp,
    autoStart: step === 3,
    onExpire: () => submitAssessment(),
  });

  const submitAssessment = () => {
    const correctAnswers = questions.reduce((acc, question) => {
      return answers[question.id] === question.correct ? acc + 1 : acc;
    }, 0);
    const computedScore = Math.round((correctAnswers / questions.length) * 100);
    const level = levelFromScore(computedScore);

    setScore(computedScore);
    setAssignedLevel(level);
    setStep(4);
  };

  useEffect(() => {
    if (step !== 4 || !assignedLevel) return;

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 12;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [step, assignedLevel]);

  useEffect(() => {
    if (step !== 4 || loadingProgress < 100 || !assignedLevel) return;

    const skillSlug = selectedSkill.toLowerCase().replace(/\s+/g, "-");

    const rawUser = localStorage.getItem("auth_user");
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser) as {
          selected_skill?: string;
          test_score?: number;
          level?: DifficultyBand;
          onboarding_complete?: boolean;
        };
        parsed.selected_skill = skillSlug;
        parsed.test_score = score ?? 0;
        parsed.level = assignedLevel;
        parsed.onboarding_complete = true;
        localStorage.setItem("auth_user", JSON.stringify(parsed));
      } catch {
        // Ignore malformed local state.
      }
    }

    const syncAndRoute = async () => {
      try {
        const { data } = await api.patch("/api/auth/onboarding", {
          selected_skill: skillSlug,
          test_score: score ?? 0,
          level: assignedLevel,
          onboarding_complete: true,
        });

        const nextToken = (data as { token?: string }).token;
        if (nextToken) {
          localStorage.setItem("token", nextToken);
        }
      } catch {
        // Keep local state if backend sync is not available.
      } finally {
        router.push(`/roadmap?skill=${skillSlug}`);
      }
    };

    const timeout = setTimeout(() => {
      void syncAndRoute();
    }, 600);

    return () => clearTimeout(timeout);
  }, [assignedLevel, loadingProgress, router, score, selectedSkill, step]);

  const stepLabel =
    step === 1
      ? "Career Discovery"
      : step === 2
      ? "Skill Selection"
      : step === 3
      ? "Beginner Assessment"
      : "Roadmap Generation";

  return (
    <div className="min-h-screen bg-black px-5 pb-20 pt-6 sm:px-8">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl pt-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-surface rounded-3xl p-7 sm:p-9"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
                Onboarding Wizard
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
                {stepLabel}
              </h1>
            </div>
            <div className="rounded-full border border-white/20 px-4 py-2 text-xs text-slate-300">
              Step {step} / 4
            </div>
          </div>

          {step === 1 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
                  Path A
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Personality Diagnostic
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  10-15 interest and work-style questions to recommend top career
                  domains.
                </p>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/40"
                >
                  Continue
                </button>
              </article>

              <article className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
                  Path B
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">Job Market</h2>
                <div className="mt-3 space-y-2">
                  {jobMarket.map((role) => (
                    <div
                      key={role.role}
                      className="rounded-lg border border-white/10 bg-black/30 p-3"
                    >
                      <p className="text-sm font-medium text-white">{role.role}</p>
                      <p className="text-xs text-slate-400">
                        {role.salary} • Demand {role.demand}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/40"
                >
                  Continue
                </button>
              </article>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-xl border border-white/20 px-4 py-3 text-sm text-slate-300 transition hover:text-white lg:col-span-2"
              >
                Skip, I know what I want
              </button>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <p className="mb-4 text-sm text-slate-300">
                Select one skill domain to continue.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSelectedSkill(skill)}
                    className={`rounded-xl border px-4 py-4 text-left text-sm transition ${
                      selectedSkill === skill
                        ? "border-white bg-white text-black"
                        : "border-white/15 bg-black/40 text-slate-200 hover:border-white/30"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!selectedSkill}
                  onClick={() => {
                    setStep(3);
                    const next = new Date();
                    next.setMinutes(next.getMinutes() + 20);
                    restart(next);
                  }}
                  className="button-shimmer rounded-lg px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
                >
                  Confirm Skill
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-300">
                  Skill:{" "}
                  <span className="font-semibold text-white">{selectedSkill}</span>
                </p>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300">
                  Timer {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
              </div>
              <div className="space-y-3">
                {questions.map((question, idx) => (
                  <article
                    key={question.id}
                    className="rounded-xl border border-white/10 bg-black/35 p-4"
                  >
                    <p className="text-sm font-medium text-white">
                      {idx + 1}. {question.text}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
                          }
                          className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                            answers[question.id] === optionIndex
                              ? "border-white bg-white text-black"
                              : "border-white/15 bg-black/40 text-slate-300 hover:border-white/30"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={submitAssessment}
                  className="button-shimmer rounded-lg px-4 py-2 text-sm font-semibold text-black"
                >
                  Submit Test
                </button>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <p className="text-sm text-slate-300">
                Building your personalised roadmap...
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-white via-slate-200 to-sky-200"
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.2, ease: "linear" }}
                />
              </div>
              <p className="text-sm text-slate-400">
                Assessment Score:{" "}
                <span className="font-semibold text-white">{score ?? 0}%</span> •
                Assigned Level:{" "}
                <span className="font-semibold text-white">{assignedLevel}</span>
              </p>
            </div>
          ) : null}
        </motion.section>
      </main>
    </div>
  );
}
