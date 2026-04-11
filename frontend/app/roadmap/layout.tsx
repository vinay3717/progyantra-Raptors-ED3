"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { toggleFxMode, useFxMode } from "@/hooks/useFxMode";
import AntigravityBackground from "@/components/roadmap/AntigravityBackground";
import RoadmapPillNav from "@/components/roadmap/RoadmapPillNav";
import { RoadmapRuntimeProvider, useRoadmapRuntime } from "@/components/roadmap/RoadmapRuntimeProvider";

function RoadmapShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { roadmap, completionRate } = useRoadmapRuntime();
  const fxMode = useFxMode();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <AntigravityBackground />

      <header className="relative z-20 px-[8vw] pt-[4.5vh]">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between rounded-full border border-white/10 bg-black/40 px-5 py-3 backdrop-blur-xl">
          <div>
            <p className="text-[10px] tracking-[0.26em] text-white/55 uppercase">Roadmap Development Space</p>
            <h1 className="font-display text-xl tracking-tight text-white sm:text-2xl">
              {roadmap?.skill.replace(/-/g, " ") ?? "Adaptive Path"}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => toggleFxMode()}
              className="rounded-full border border-white/15 bg-black/45 px-3 py-2 text-xs tracking-[0.16em] text-white/75 uppercase transition hover:border-white/35 hover:text-white"
            >
              FX {fxMode === "3d" ? "3D" : "Lite"}
            </button>
            <div className="rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-right">
              <p className="text-[10px] tracking-[0.18em] text-white/55 uppercase">Slot Completion</p>
              <p className="text-sm font-medium text-white">{completionRate}%</p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/6 text-sm font-semibold text-white">
              {roadmap?.skill.slice(0, 2).toUpperCase() ?? "AL"}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-20 mx-auto w-full max-w-[1600px] px-[8vw] pb-32 pt-[6vh]">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {children}
        </motion.div>
      </main>

      <RoadmapPillNav />
    </div>
  );
}

function RoadmapLayoutFallback() {
  return (
    <div className="min-h-screen bg-black px-[8vw] py-[8vh]">
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`roadmap-shell-fallback-${index}`}
            className="ghost-loader h-28 rounded-3xl border border-white/10"
          />
        ))}
      </div>
    </div>
  );
}

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<RoadmapLayoutFallback />}>
      <RoadmapRuntimeProvider>
        <RoadmapShell>{children}</RoadmapShell>
      </RoadmapRuntimeProvider>
    </Suspense>
  );
}
