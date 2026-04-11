"use client";

import { motion } from "framer-motion";
import { Clock3, Flag, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTimer } from "react-timer-hook";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

const questions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "In React, why should list items include stable keys?",
    options: [
      "To avoid rerendering all list items on every update",
      "To make CSS selectors shorter",
      "To enable TypeScript generics",
      "To increase API speed",
    ],
    answer: 0,
    explanation: "Stable keys help React reconcile updates efficiently and preserve component identity.",
  },
  {
    id: "q2",
    prompt: "What is the most correct use of HTTP 401?",
    options: [
      "The request was successful",
      "The client is unauthenticated",
      "The resource was permanently removed",
      "The server timed out",
    ],
    answer: 1,
    explanation: "HTTP 401 signals that authentication is required or invalid.",
  },
  {
    id: "q3",
    prompt: "Which option best describes idempotent HTTP methods?",
    options: [
      "They always create new resources",
      "Calling them multiple times has the same effect as once",
      "They must include a request body",
      "They are only used with GraphQL",
    ],
    answer: 1,
    explanation: "Idempotent methods can be repeated without changing the final result.",
  },
  {
    id: "q4",
    prompt: "In SQL indexing, what is a common tradeoff?",
    options: [
      "Faster reads but slower writes",
      "Faster writes but no read gain",
      "No tradeoff, indexes always improve everything",
      "Indexes are only useful for tiny tables",
    ],
    answer: 0,
    explanation: "Indexes speed up reads, but they add maintenance overhead during writes.",
  },
  {
    id: "q5",
    prompt: "What is the primary purpose of unit tests?",
    options: [
      "Replace code reviews",
      "Guarantee zero bugs in production",
      "Validate behavior of small isolated units",
      "Measure internet speed",
    ],
    answer: 2,
    explanation: "Unit tests focus on small parts of code to verify expected behavior quickly.",
  },
];

export default function TestPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "incorrect">("idle");

  const expiry = useMemo(() => {
    const next = new Date();
    next.setMinutes(next.getMinutes() + 15);
    return next;
  }, []);

  const { minutes, seconds } = useTimer({
    expiryTimestamp: expiry,
    onExpire: () => {
      router.push("/roadmap/graph?reroute=true");
    },
  });

  const current = questions[index];
  const finished = index >= questions.length;

  useEffect(() => {
    if (failCount < 3) return;
    const timeout = setTimeout(() => {
      router.push("/roadmap/graph?reroute=true");
    }, 1000);

    return () => clearTimeout(timeout);
  }, [failCount, router]);

  return (
    <div className="min-h-screen bg-black px-[6vw] pb-20 pt-10 text-white">
      <main className="mx-auto w-full max-w-4xl space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="rounded-[2rem] border border-white/12 bg-black/45 p-7 backdrop-blur-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.24em] text-white/55 uppercase">Test Section</p>
              <h1 className="mt-2 font-display text-5xl tracking-tighter text-white sm:text-6xl">
                Timed Assessment
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm">
              <Clock3 className="h-4 w-4 text-cyan-200" />
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
          </div>
        </motion.section>

        {finished ? (
          <section className="rounded-[2rem] border border-white/12 bg-black/45 p-7 text-center backdrop-blur-xl">
            <h2 className="font-display text-4xl tracking-tight text-white">Assessment Complete</h2>
            <p className="mt-3 text-sm text-white/70">
              You scored {score} / {questions.length}. Continue to your roadmap flow.
            </p>
            <button
              type="button"
              onClick={() => router.push("/roadmap/graph")}
              className="mt-6 rounded-full border border-white/20 px-5 py-2 text-sm text-white transition hover:border-white/40"
            >
              Open Graph
            </button>
          </section>
        ) : (
          <section className="space-y-4 rounded-[2rem] border border-white/12 bg-black/45 p-7 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs tracking-[0.16em] text-white/55 uppercase">
                Question {index + 1} / {questions.length}
              </p>
              <div className="flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-500/[0.08] px-3 py-1 text-xs text-orange-100">
                <ShieldAlert className="h-3.5 w-3.5" />
                Fail Count {failCount}/3
              </div>
            </div>

            <h2 className="font-display text-3xl tracking-tight text-white">{current.prompt}</h2>

            <div className="space-y-2">
              {current.options.map((option, optionIndex) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelected(optionIndex)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    selected === optionIndex
                      ? "border-cyan-100 bg-cyan-200/12 text-white"
                      : "border-white/12 bg-black/45 text-white/72 hover:border-white/35 hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                disabled={selected === null}
                onClick={() => {
                  if (selected === null) return;

                  const isCorrect = selected === current.answer;
                  setFeedback(isCorrect ? "correct" : "incorrect");

                  if (isCorrect) {
                    setScore((value) => value + 1);
                  } else {
                    setFailCount((value) => value + 1);
                  }
                }}
                className="rounded-full border border-cyan-200/35 bg-cyan-200/12 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-200/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/35"
              >
                Check Answer
              </button>

              <button
                type="button"
                disabled={feedback === "idle"}
                onClick={() => {
                  setFeedback("idle");
                  setSelected(null);
                  setIndex((value) => value + 1);
                }}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 transition hover:border-white/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/35"
              >
                Next Question
              </button>
            </div>

            {feedback !== "idle" ? (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  feedback === "correct"
                    ? "border-emerald-300/35 bg-emerald-400/[0.08] text-emerald-100"
                    : "border-orange-300/35 bg-orange-400/[0.08] text-orange-100"
                }`}
              >
                <p>{feedback === "correct" ? "Correct answer." : "Incorrect answer."}</p>
                <p className="mt-1 text-xs opacity-85">{current.explanation}</p>
              </div>
            ) : null}

            {failCount >= 3 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-orange-300/35 bg-orange-500/[0.1] px-4 py-3 text-xs text-orange-100"
              >
                <Flag className="h-4 w-4" />
                Three failed attempts reached. Rerouting to graph adaptation.
              </motion.div>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
}
