"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import AIMentor from "@/components/AIMentor";
import ScoreBar from "@/components/ScoreBar";
import BadgePopup from "@/components/BadgePopup";
import StreakCounter from "@/components/StreakCounter";
import { useRoadmap } from "@/hooks/useRoadmap";
import Overview from "@/app/roadmap/components/Overview";
import GraphView from "@/app/roadmap/components/GraphView";
import RoadmapAccordion from "@/app/roadmap/components/RoadmapAccordion";

export default function RoadmapPage() {
  const searchParams = useSearchParams();
  const skill = searchParams.get("skill") ?? "web-development";
  const [badge, setBadge] = useState<string | null>(null);
  const [streakDays] = useState(7);
  const { roadmap, loading, error, completionRate, markSubpointCompleted } =
    useRoadmap(skill);

  useEffect(() => {
    if (!badge) return;
    const timeout = setTimeout(() => setBadge(null), 2600);
    return () => clearTimeout(timeout);
  }, [badge]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-5 pt-6 sm:px-8">
        <Navbar />
        <main className="mx-auto mt-8 w-full max-w-6xl space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </main>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-black px-5 pt-6 sm:px-8">
        <Navbar />
        <main className="mx-auto mt-10 w-full max-w-3xl rounded-3xl border border-white/10 bg-black/60 p-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-white">
            Roadmap unavailable
          </h1>
          <p className="mt-3 text-slate-300">
            We could not load roadmap data right now.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-5 pb-20 pt-6 sm:px-8">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl space-y-6 pt-8">
        {error ? (
          <p className="rounded-xl border border-amber-300/20 bg-amber-200/10 px-4 py-2 text-sm text-amber-200">
            {error}
          </p>
        ) : null}

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]"
        >
          <ScoreBar
            score={roadmap.user_score}
            total={roadmap.total_score}
            tier={roadmap.score_tier}
          />
          <StreakCounter streakDays={streakDays} />
        </motion.section>

        <Overview
          skill={roadmap.skill}
          difficulty={roadmap.difficulty_band}
          overview={roadmap.overview}
        />

        <GraphView
          nodes={roadmap.graph.nodes}
          edges={roadmap.graph.edges}
          onNodeClick={(unitId) => {
            const element = document.getElementById(`unit-${unitId}`);
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        />

        <RoadmapAccordion
          units={roadmap.units}
          onCompleteSubpoint={async (subpointId, scoreEarned) => {
            await markSubpointCompleted(subpointId, scoreEarned);
            setBadge("Progress Updated");
          }}
        />
      </main>

      <AIMentor
        skill={roadmap.skill}
        level={roadmap.difficulty_band}
        progress={completionRate}
      />
      <BadgePopup badge={badge} />
    </div>
  );
}
