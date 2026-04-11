"use client";

import { motion } from "framer-motion";
import {
  BookOpenCheck,
  Braces,
  BrainCircuit,
  ChartSpline,
  Layers2,
  Rocket,
} from "lucide-react";
import FeaturePlaceholder from "@/components/FeaturePlaceholder";
import GhostLoaders from "@/components/roadmap/GhostLoaders";
import { useRoadmapRuntime } from "@/components/roadmap/RoadmapRuntimeProvider";

const roadmapIcons = [Rocket, Layers2, BrainCircuit, ChartSpline, Braces, BookOpenCheck];

export default function RoadmapOverviewPage() {
  const { roadmap, loading, error, timeline, activeUnitId, setActiveUnitId } = useRoadmapRuntime();

  if (loading) {
    return <GhostLoaders lines={5} className="pt-4" />;
  }

  if (!roadmap) {
    return (
      <FeaturePlaceholder
        title="Roadmap Not Synced"
        description="We could not load the learning path right now. The module structure will appear once the roadmap service responds."
      />
    );
  }

  return (
    <section className="space-y-8">
      <header className="max-w-5xl space-y-4">
        <p className="text-xs tracking-[0.24em] text-white/55 uppercase">Overview</p>
        <h2 className="font-display text-5xl tracking-tighter text-white sm:text-6xl">
          Skill Path Syllabus
        </h2>
        <p className="max-w-3xl text-sm leading-8 text-white/68 sm:text-base">
          Designed with a zero-clutter subway flow. Each module opens on hover with
          concise outcomes and skill tags, so you can scan quickly without dense text.
        </p>
        {error ? (
          <p className="rounded-2xl border border-orange-300/25 bg-orange-400/5 px-4 py-2 text-xs text-orange-200">
            {error}
          </p>
        ) : null}
      </header>

      <div className="relative space-y-7 pl-10 before:absolute before:top-3 before:bottom-3 before:left-4 before:w-px before:bg-white/15">
        {roadmap.units.map((unit, index) => {
          const milestone = timeline.find((item) => item.unitId === unit.id);
          const completion = milestone ? Math.round(milestone.completion * 100) : 0;
          const isActive = activeUnitId === unit.id;
          const Icon = roadmapIcons[index % roadmapIcons.length];

          return (
            <motion.article
              key={unit.id}
              animate={{ y: [-5, 5] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "mirror", duration: 6.5 + index }}
              className={`group relative rounded-[2rem] border p-6 backdrop-blur-xl transition ${
                isActive
                  ? "border-cyan-100/40 bg-cyan-400/[0.08]"
                  : "border-white/12 bg-black/40 hover:border-white/25"
              }`}
            >
              <span
                className={`absolute top-8 -left-[1.95rem] h-4 w-4 rounded-full border ${
                  completion >= 100
                    ? "border-emerald-200 bg-emerald-300"
                    : completion > 0
                      ? "border-cyan-100 bg-cyan-300"
                      : "border-white/40 bg-black"
                }`}
              />

              <button
                type="button"
                onClick={() => setActiveUnitId(unit.id)}
                className="flex w-full flex-wrap items-center justify-between gap-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-black/50">
                    <Icon className="h-5 w-5 text-cyan-100" />
                  </span>
                  <div>
                    <p className="text-xs tracking-[0.16em] text-white/55 uppercase">
                      {milestone?.dateLabel ?? `Week ${index + 1}`}
                    </p>
                    <h3 className="mt-1 font-display text-2xl tracking-tight text-white">
                      {unit.title}
                    </h3>
                  </div>
                </div>

                <div className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                  {completion}% complete
                </div>
              </button>

              <div className="mt-4 flex flex-wrap gap-2">
                {unit.subpoints.slice(0, 3).map((subpoint) => (
                  <span
                    key={subpoint.id}
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] text-white/75"
                  >
                    {subpoint.assessment_type}
                  </span>
                ))}
              </div>

              <div className="mt-4 max-h-0 overflow-hidden border-t border-transparent pt-0 opacity-0 transition-all duration-500 group-hover:max-h-80 group-hover:border-white/10 group-hover:pt-4 group-hover:opacity-100">
                <ul className="space-y-2 text-sm leading-7 text-white/72">
                  {unit.subpoints.map((subpoint) => (
                    <li key={subpoint.id} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-100/75" />
                      <span>{subpoint.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
