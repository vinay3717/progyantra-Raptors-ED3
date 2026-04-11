"use client";

import { Flame } from "lucide-react";
import { motion } from "framer-motion";

type StreakCounterProps = {
  streakDays: number;
};

export default function StreakCounter({ streakDays }: StreakCounterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
      className="card-surface rounded-2xl p-5"
    >
      <div className="mb-2 flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-300" />
        <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Streak</p>
      </div>
      <p className="font-display text-2xl font-semibold text-white">
        {streakDays} Days
      </p>
      <p className="mt-1 text-sm text-slate-400">
        Keep your daily momentum alive.
      </p>
    </motion.div>
  );
}
