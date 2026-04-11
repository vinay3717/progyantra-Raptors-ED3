"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

type PersonalityQuestion = {
  question_id: number;
  dimension: string;
  question_text: string;
  type: string;
  options: string[];
  explanation_for_adaptation?: string;
};

type PersonalityAnswer = {
  question_id: number;
  dimension: string;
  answer: string;
};

type PersonalityApiResponse = {
  assistant_message: string;
  parsed_question?: unknown;
};

const LIKERT_OPTIONS = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

const PERSONALITY_TARGET_QUESTIONS = 8;

const LIKERT_TO_SCORE: Record<string, number> = {
  "strongly disagree": 1,
  disagree: 2,
  neutral: 3,
  agree: 4,
  "strongly agree": 5,
};

const SKILLS = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "AI/ML",
  "Cybersecurity",
  "Cloud & DevOps",
  "Blockchain",
  "UI/UX Design",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);
}

function toPersonalityQuestion(value: unknown): PersonalityQuestion | null {
  if (!isRecord(value)) return null;
  if (typeof value.question_text !== "string" || typeof value.dimension !== "string") {
    return null;
  }

  const type = typeof value.type === "string" ? value.type : "likert";
  const options = asStringArray(value.options);

  return {
    question_id:
      typeof value.question_id === "number" && Number.isFinite(value.question_id)
        ? Math.max(1, Math.floor(value.question_id))
        : 1,
    dimension: value.dimension.trim(),
    question_text: value.question_text.trim(),
    type,
    options: options.length > 0 ? options : type.toLowerCase() === "likert" ? LIKERT_OPTIONS : [],
    explanation_for_adaptation:
      typeof value.explanation_for_adaptation === "string"
        ? value.explanation_for_adaptation
        : undefined,
  };
}

function apiErrorDetail(error: unknown): string | null {
  if (!isRecord(error)) return null;
  const response = error.response;
  if (!isRecord(response)) return null;
  const data = response.data;
  if (isRecord(data) && typeof data.detail === "string") return data.detail;
  if (typeof data === "string" && data.trim().length > 0) return data.trim();
  return null;
}

function extractQuestion(response: PersonalityApiResponse): PersonalityQuestion | null {
  const parsedFirst = toPersonalityQuestion(response.parsed_question);
  if (parsedFirst) return parsedFirst;

  if (!response.assistant_message) return null;
  try {
    const parsed = JSON.parse(response.assistant_message);
    return toPersonalityQuestion(parsed);
  } catch {
    return null;
  }
}

function buildPersonalityScores(answers: PersonalityAnswer[]): Record<string, number> {
  const buckets = new Map<string, { sum: number; count: number }>();
  for (const answer of answers) {
    const dimension = answer.dimension.trim();
    if (!dimension) continue;
    const normalized = answer.answer.trim().toLowerCase();
    const score = LIKERT_TO_SCORE[normalized] ?? 3;
    const current = buckets.get(dimension) ?? { sum: 0, count: 0 };
    current.sum += score;
    current.count += 1;
    buckets.set(dimension, current);
  }

  const result: Record<string, number> = {};
  for (const [key, value] of buckets.entries()) {
    result[key] = Number((value.sum / value.count).toFixed(2));
  }
  return result;
}

function recommendedSkillsFromScores(scores: Record<string, number>): string[] {
  const adaptability = scores["Adaptability & Cognitive Flexibility"] ?? 3;
  const focus = scores["Attention Span & Focus Duration"] ?? 3;
  const pace = scores["Learning Pace & Speed"] ?? 3;
  const discipline = scores["Self-Discipline & Consistency"] ?? 3;

  if (adaptability >= 4 && focus >= 4) return ["AI/ML", "Data Science", "Cloud & DevOps"];
  if (discipline >= 4 && pace >= 3.5) return ["Web Development", "Cybersecurity", "Cloud & DevOps"];
  if (focus <= 2.5) return ["UI/UX Design", "Mobile Development", "Web Development"];
  return ["Web Development", "Data Science", "AI/ML"];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSkill, setSelectedSkill] = useState("");

  const [personalityStarted, setPersonalityStarted] = useState(false);
  const [personalityCompleted, setPersonalityCompleted] = useState(false);
  const [personalityLoading, setPersonalityLoading] = useState(false);
  const [personalityError, setPersonalityError] = useState<string | null>(null);
  const [personalityQuestion, setPersonalityQuestion] = useState<PersonalityQuestion | null>(null);
  const [personalityAnswers, setPersonalityAnswers] = useState<PersonalityAnswer[]>([]);

  const personalityScores = useMemo(
    () => buildPersonalityScores(personalityAnswers),
    [personalityAnswers]
  );
  const recommendedSkills = useMemo(
    () => recommendedSkillsFromScores(personalityScores),
    [personalityScores]
  );

  const requestNextPersonalityQuestion = async (
    previousAnswers: PersonalityAnswer[]
  ): Promise<void> => {
    setPersonalityLoading(true);
    setPersonalityError(null);
    try {
      const { data } = await api.post<PersonalityApiResponse>(
        "/api/personality-test/next-question",
        {
          target_skill: selectedSkill || null,
          previous_answers: previousAnswers,
        }
      );

      const nextQuestion = extractQuestion(data);
      if (!nextQuestion) {
        throw new Error("Backend returned invalid question JSON.");
      }
      setPersonalityQuestion(nextQuestion);
    } catch (error) {
      setPersonalityQuestion(null);
      setPersonalityError(
        apiErrorDetail(error) ??
          "Could not generate personality question. Please check backend and Gemini setup."
      );
    } finally {
      setPersonalityLoading(false);
    }
  };

  const startPersonalityTest = async (): Promise<void> => {
    setPersonalityStarted(true);
    setPersonalityCompleted(false);
    setPersonalityAnswers([]);
    await requestNextPersonalityQuestion([]);
  };

  const submitPersonalityAnswer = async (answer: string): Promise<void> => {
    if (!personalityQuestion || personalityLoading) return;

    const updated: PersonalityAnswer[] = [
      ...personalityAnswers,
      {
        question_id: personalityQuestion.question_id,
        dimension: personalityQuestion.dimension,
        answer,
      },
    ];
    setPersonalityAnswers(updated);

    if (updated.length >= PERSONALITY_TARGET_QUESTIONS) {
      setPersonalityCompleted(true);
      setPersonalityQuestion(null);
      setStep(2);
      return;
    }

    await requestNextPersonalityQuestion(updated);
  };

  const proceedToSkillSelection = () => {
    if (personalityAnswers.length > 0) {
      setPersonalityCompleted(true);
    }
    setStep(2);
  };

  const continueToBeginnerTest = () => {
    if (!selectedSkill) return;
    const skillSlug = selectedSkill.toLowerCase().replace(/\s+/g, "-");

    const rawUser = localStorage.getItem("auth_user");
    let parsed: Record<string, unknown> = {};
    if (rawUser) {
      try {
        const userObj = JSON.parse(rawUser);
        if (isRecord(userObj)) {
          parsed = { ...userObj };
        }
      } catch {
        parsed = {};
      }
    }

    parsed.selected_skill = skillSlug;
    parsed.personality_scores = Object.keys(personalityScores).length > 0 ? personalityScores : null;
    parsed.personality_answers = personalityAnswers;
    localStorage.setItem("auth_user", JSON.stringify(parsed));
    router.push(`/onboarding/beginner-test?skill=${encodeURIComponent(skillSlug)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080611] via-[#130b24] to-[#07050d] px-5 pb-20 pt-6 sm:px-8">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl pt-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="card-surface rounded-3xl border border-violet-300/20 bg-black/35 p-7 shadow-[0_0_80px_rgba(124,58,237,0.15)] backdrop-blur-xl sm:p-9"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-violet-200/70">New Registration</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
                {step === 1 ? "Personality Test" : "Skill Recommendation & Selection"}
              </h1>
            </div>
            <div className="rounded-full border border-violet-300/25 bg-violet-500/10 px-4 py-2 text-xs text-violet-100">
              Step {step} / 2
            </div>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Adaptive questions are generated from your custom backend prompt. Answer one-by-one
                so we can personalize your Beginner Test and roadmap.
              </p>

              {!personalityStarted ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void startPersonalityTest()}
                    className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110"
                  >
                    Start Personality Test
                  </button>
                  <button
                    type="button"
                    onClick={proceedToSkillSelection}
                    className="rounded-xl border border-violet-300/30 px-5 py-2.5 text-sm text-violet-100 transition hover:border-violet-200/60"
                  >
                    Skip for now
                  </button>
                </div>
              ) : null}

              {personalityStarted ? (
                <div className="space-y-3">
                  <p className="text-xs text-violet-200/80">
                    Progress {personalityAnswers.length}/{PERSONALITY_TARGET_QUESTIONS}
                  </p>

                  <div className="h-2 overflow-hidden rounded-full bg-violet-950/70">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-400 transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (personalityAnswers.length / PERSONALITY_TARGET_QUESTIONS) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  {personalityLoading ? (
                    <div className="rounded-2xl border border-violet-300/20 bg-black/35 p-4 text-sm text-violet-100">
                      Generating your next adaptive question...
                    </div>
                  ) : null}

                  {personalityError ? (
                    <div className="rounded-2xl border border-rose-300/30 bg-rose-950/20 p-4 text-sm text-rose-200">
                      {personalityError}
                    </div>
                  ) : null}

                  {personalityQuestion ? (
                    <div className="rounded-2xl border border-violet-300/20 bg-black/40 p-5">
                      <p className="text-xs uppercase tracking-[0.16em] text-violet-200/70">
                        {personalityQuestion.dimension}
                      </p>
                      <p className="mt-2 text-sm font-medium leading-7 text-white">
                        {personalityQuestion.question_text}
                      </p>
                      <div className="mt-4 grid gap-2">
                        {(personalityQuestion.options.length > 0
                          ? personalityQuestion.options
                          : LIKERT_OPTIONS
                        ).map((option) => (
                          <button
                            key={option}
                            type="button"
                            disabled={personalityLoading}
                            onClick={() => void submitPersonalityAnswer(option)}
                            className="rounded-lg border border-violet-300/25 bg-violet-900/10 px-3 py-2 text-left text-xs text-violet-100 transition hover:border-violet-200/70 hover:bg-violet-700/20 disabled:opacity-60"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={proceedToSkillSelection}
                      className="rounded-xl border border-violet-300/30 px-4 py-2 text-xs text-violet-100 transition hover:border-violet-200/70"
                    >
                      Continue to Skill Selection
                    </button>
                    {personalityError ? (
                      <button
                        type="button"
                        onClick={() => void requestNextPersonalityQuestion(personalityAnswers)}
                        className="rounded-xl bg-violet-600/85 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
                      >
                        Retry Question
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <p className="text-sm text-slate-300">
                Choose your domain. Next we will run the adaptive Beginner Test (12-20 questions)
                before roadmap generation.
              </p>

              {personalityCompleted ? (
                <div className="rounded-2xl border border-violet-300/25 bg-violet-900/15 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-violet-200/70">Recommended For You</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recommendedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-violet-200/40 bg-violet-600/20 px-3 py-1 text-xs text-violet-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSelectedSkill(skill)}
                    className={`rounded-xl border px-4 py-4 text-left text-sm transition ${
                      selectedSkill === skill
                        ? "border-violet-200 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-900/45"
                        : "border-violet-300/20 bg-black/35 text-violet-100 hover:border-violet-200/60"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-violet-300/30 px-4 py-2 text-sm text-violet-100 transition hover:border-violet-200/70"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!selectedSkill}
                  onClick={continueToBeginnerTest}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue to Beginner Test
                </button>
              </div>
            </div>
          ) : null}
        </motion.section>
      </main>
    </div>
  );
}
