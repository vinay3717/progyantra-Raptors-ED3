"use client";

import { motion } from "framer-motion";

type ScoreBarProps = {
  score: number;
  total: number;
  tier: string;
};

export default function ScoreBar({ score, total, tier }: ScoreBarProps) {
  const percent = total > 0 ? Math.min((score / total) * 100, 100) : 0;

  return (
    <div className="card-surface rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
          Score Progress
        </p>
        <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white">
          Tier {tier}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 95, damping: 18 }}
          className="h-full rounded-full bg-gradient-to-r from-white via-slate-200 to-sky-200"
        />
      </div>
      <p className="mt-3 text-sm text-slate-300">
        {score} / {total} points
      </p>
    </div>
  );
}
