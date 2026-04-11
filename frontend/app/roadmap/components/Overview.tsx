"use client";

import { motion } from "framer-motion";
import type { DifficultyBand, RoadmapOverview } from "@/types/roadmap";
import { difficultyLabel } from "@/hooks/useRoadmap";

type OverviewProps = {
  skill: string;
  difficulty: DifficultyBand;
  overview: RoadmapOverview;
};

export default function Overview({ skill, difficulty, overview }: OverviewProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="card-surface rounded-3xl p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-white capitalize">
          {skill.replace("-", " ")}
        </h2>
        <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white">
          {difficultyLabel(difficulty)}
        </span>
      </div>

      <p className="text-sm leading-7 text-slate-300 sm:text-base">
        {overview.description}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs tracking-[0.18em] text-slate-400 uppercase">
            Career Impact
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            {overview.career_impact}
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs tracking-[0.18em] text-slate-400 uppercase">
            Program Outcomes
          </p>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            {overview.program_outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-200" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
        <p className="text-xs tracking-[0.18em] text-slate-400 uppercase">
          Syllabus Summary
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {overview.syllabus_summary.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200"
            >
              {topic}
            </span>
          ))}
        </div>
      </article>
    </motion.section>
  );
}
