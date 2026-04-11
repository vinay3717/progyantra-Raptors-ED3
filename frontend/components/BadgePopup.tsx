"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Award } from "lucide-react";

type BadgePopupProps = {
  badge: string | null;
};

export default function BadgePopup({ badge }: BadgePopupProps) {
  return (
    <AnimatePresence>
      {badge ? (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.98 }}
          transition={{ duration: 0.35 }}
          className="fixed right-6 bottom-6 z-[70] max-w-xs rounded-2xl border border-white/15 bg-black/80 p-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-white/10 p-2">
              <Award className="h-4 w-4 text-yellow-300" />
            </span>
            <div>
              <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
                Badge Unlocked
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{badge}</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
