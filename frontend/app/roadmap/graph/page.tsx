"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Binary, Route, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import FeaturePlaceholder from "@/components/FeaturePlaceholder";
import GhostLoaders from "@/components/roadmap/GhostLoaders";
import { useRoadmapRuntime } from "@/components/roadmap/RoadmapRuntimeProvider";
import WavyRoadmapGraph from "@/components/roadmap/WavyRoadmapGraph";

const graphTabs = [
  { id: "spatial", label: "Spatial" },
  { id: "timeline", label: "Timeline" },
  { id: "notes", label: "Notes" },
] as const;

type GraphTab = (typeof graphTabs)[number]["id"];

export default function RoadmapGraphPage() {
  const searchParams = useSearchParams();
  const rerouteMode = searchParams.get("reroute") === "true";

  const {
    roadmap,
    loading,
    error,
    timeline,
    activeUnitId,
    setActiveUnitId,
    completeNextTask,
  } = useRoadmapRuntime();

  const [tab, setTab] = useState<GraphTab>("spatial");

  const rerouteNodes = useMemo(
    () => [
      {
        title: "Foundation Recovery",
        note: "A short detour that revisits weak spots before the next milestone.",
      },
      {
        title: "Adaptive Mini Challenge",
        note: "A focused checkpoint created from your recent wrong answers.",
      },
    ],
    []
  );

  if (loading) {
    return <GhostLoaders lines={4} className="pt-4" />;
  }

  if (!roadmap) {
    return (
      <FeaturePlaceholder
        title="Graph In Orbit"
        description="The 3D graph endpoint has not returned yet. Once connected, this area will display the full node network."
      />
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <p className="text-xs tracking-[0.24em] text-white/55 uppercase">Graph View</p>
        <h2 className="font-display text-5xl tracking-tighter text-white sm:text-6xl">
          Wavy Path Control Room
        </h2>
        <p className="max-w-3xl text-sm leading-8 text-white/68 sm:text-base">
          Follow milestones on a drifting wave timeline. Completing a task pushes the
          active signal forward to the next path segment.
        </p>

        {rerouteMode ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-2xl border border-orange-300/35 bg-orange-500/[0.08] px-4 py-2 text-xs text-orange-100"
          >
            <AlertTriangle className="h-4 w-4" />
            Reroute mode is active. Additional remediation nodes are now visible.
          </motion.div>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-orange-300/25 bg-orange-400/5 px-4 py-2 text-xs text-orange-200">
            {error}
          </p>
        ) : null}
      </header>

      <div className="inline-flex gap-2 rounded-full border border-white/12 bg-black/45 p-1.5 backdrop-blur-xl">
        {graphTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-1.5 text-xs tracking-[0.14em] uppercase transition ${
              tab === item.id
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "spatial" ? (
        <WavyRoadmapGraph
          timeline={timeline}
          activeUnitId={activeUnitId}
          rerouteMode={rerouteMode}
          onActiveChange={setActiveUnitId}
          onCompleteTask={async (unitId) => {
            await completeNextTask(unitId);
          }}
        />
      ) : null}

      {tab === "timeline" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {timeline.map((item, index) => (
            <motion.article
              key={item.unitId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-3xl border border-white/12 bg-black/45 p-5 backdrop-blur-xl"
            >
              <p className="text-xs tracking-[0.16em] text-white/55 uppercase">{item.dateLabel}</p>
              <h3 className="mt-2 font-display text-2xl tracking-tight text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/70">{item.note}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-white"
                  style={{ width: `${Math.round(item.completion * 100)}%` }}
                />
              </div>
            </motion.article>
          ))}

          {rerouteMode
            ? rerouteNodes.map((node, index) => (
                <motion.article
                  key={node.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + index * 0.08 }}
                  className="rounded-3xl border border-orange-300/30 bg-orange-500/[0.06] p-5"
                >
                  <p className="text-xs tracking-[0.16em] text-orange-200/75 uppercase">Reroute Node</p>
                  <h3 className="mt-2 text-xl text-orange-50">{node.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-orange-100/80">{node.note}</p>
                </motion.article>
              ))
            : null}
        </div>
      ) : null}

      {tab === "notes" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-white/12 bg-black/45 p-5">
            <Route className="h-5 w-5 text-cyan-200" />
            <h3 className="mt-3 text-lg text-white">Path Signals</h3>
            <p className="mt-2 text-sm leading-7 text-white/68">
              Nodes are segmented by completion ratio and unlock order. Active nodes
              pulse while locked nodes remain dimmed.
            </p>
          </article>
          <article className="rounded-3xl border border-white/12 bg-black/45 p-5">
            <Binary className="h-5 w-5 text-cyan-200" />
            <h3 className="mt-3 text-lg text-white">Timeline Logic</h3>
            <p className="mt-2 text-sm leading-7 text-white/68">
              The wave trajectory aligns with unit order and expected calendar slots,
              making progress and dependencies easier to read.
            </p>
          </article>
          <article className="rounded-3xl border border-white/12 bg-black/45 p-5">
            <Sparkles className="h-5 w-5 text-cyan-200" />
            <h3 className="mt-3 text-lg text-white">Adaptive Detours</h3>
            <p className="mt-2 text-sm leading-7 text-white/68">
              When reroute mode is triggered, remediation nodes are injected so weak
              concept areas can be reinforced before advancing.
            </p>
          </article>
        </div>
      ) : null}
    </section>
  );
}
