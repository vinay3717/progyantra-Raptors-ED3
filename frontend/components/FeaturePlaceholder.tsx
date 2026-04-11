"use client";

import { BellRing, Orbit } from "lucide-react";
import { motion } from "framer-motion";

type FeaturePlaceholderProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  className?: string;
  tone?: "neutral" | "warning";
  onNotify?: () => void;
};

export default function FeaturePlaceholder({
  title = "In Orbit",
  description = "This module is waiting for backend data sync. You can continue exploring the current prototype.",
  actionLabel = "Notify Me",
  className,
  tone = "neutral",
  onNotify,
}: FeaturePlaceholderProps) {
  const toneClass =
    tone === "warning"
      ? "border-orange-300/30 bg-orange-500/[0.06]"
      : "border-white/15 bg-white/[0.03]";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`rounded-[2rem] border ${toneClass} p-8 backdrop-blur-xl ${className ?? ""}`}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-black/50">
          <motion.span
            className="absolute h-20 w-20 rounded-full border border-cyan-200/30"
            animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.75, 0.35] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.4, ease: "easeInOut" }}
          />
          <motion.span
            className="absolute h-14 w-14 rounded-full border border-cyan-200/40"
            animate={{ scale: [1.1, 0.92, 1.1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.1, ease: "easeInOut" }}
          />
          <Orbit className="h-7 w-7 text-cyan-100" />
        </div>

        <div>
          <p className="text-xs tracking-[0.24em] text-white/55 uppercase">Feature Placeholder</p>
          <h3 className="mt-2 font-display text-3xl tracking-tight text-white">{title}</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/70">{description}</p>
        </div>

        <button
          type="button"
          onClick={onNotify}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm text-white transition hover:border-white/40 hover:bg-white/10"
        >
          <BellRing className="h-4 w-4" />
          {actionLabel}
        </button>
      </div>
    </motion.section>
  );
}
