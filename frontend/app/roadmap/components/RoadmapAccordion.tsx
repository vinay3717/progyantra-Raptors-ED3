"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown, ExternalLink, Lock } from "lucide-react";
import type { Unit } from "@/types/roadmap";

type RoadmapAccordionProps = {
  units: Unit[];
  onCompleteSubpoint: (subpointId: string, scoreEarned: number) => void;
};

export default function RoadmapAccordion({
  units,
  onCompleteSubpoint,
}: RoadmapAccordionProps) {
  const [openUnit, setOpenUnit] = useState<string | null>(units[0]?.id ?? null);

  return (
    <section className="card-surface rounded-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-white">Roadmap Units</h3>
        <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
          Main Learning Panel
        </p>
      </div>

      <div className="space-y-3">
        {units.map((unit) => {
          const isOpen = openUnit === unit.id;
          return (
            <article
              key={unit.id}
              id={`unit-${unit.id}`}
              className={`rounded-2xl border p-4 transition ${
                unit.is_locked
                  ? "border-white/8 bg-black/30 opacity-70"
                  : "border-white/15 bg-black/50"
              }`}
            >
              <button
                type="button"
                disabled={unit.is_locked}
                onClick={() => setOpenUnit(isOpen ? null : unit.id)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  {unit.is_locked ? (
                    <Lock className="h-4 w-4 text-slate-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-sky-300" />
                  )}
                  <div>
                    <h4 className="font-medium text-white">{unit.title}</h4>
                    <p className="text-xs text-slate-400">
                      {unit.user_unit_progress ?? "0/0 subpoints complete"} •{" "}
                      {unit.unit_score} points
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-300 transition ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && !unit.is_locked ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 space-y-2 border-t border-white/10 pt-4"
                >
                  {unit.subpoints.map((subpoint) => (
                    <div
                      key={subpoint.id}
                      className="rounded-xl border border-white/10 bg-black/35 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-slate-100">{subpoint.title}</p>
                        <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-slate-300 uppercase">
                          {subpoint.assessment_type}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={subpoint.status === "completed"}
                          onClick={() =>
                            onCompleteSubpoint(subpoint.id, subpoint.points_value || 10)
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            subpoint.status === "completed"
                              ? "cursor-not-allowed bg-emerald-400/20 text-emerald-300"
                              : "bg-white text-black hover:bg-slate-200"
                          }`}
                        >
                          {subpoint.status === "completed"
                            ? "Completed"
                            : "Mark Complete"}
                        </button>

                        {subpoint.practice_url ? (
                          <a
                            href={subpoint.practice_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-1.5 text-xs text-slate-300 transition hover:text-white"
                          >
                            Practice <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : null}

                        {subpoint.learning_resource_url ? (
                          <a
                            href={subpoint.learning_resource_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-1.5 text-xs text-slate-300 transition hover:text-white"
                          >
                            Learn <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
