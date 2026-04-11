"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { CheckCircle2, LockKeyhole, MoveRight, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphNodeStatus } from "@/types/roadmap";

type TimelineMilestone = {
  unitId: string;
  title: string;
  dateLabel: string;
  completion: number;
  status: GraphNodeStatus;
  note: string;
};

type WavyRoadmapGraphProps = {
  timeline: TimelineMilestone[];
  activeUnitId: string | null;
  rerouteMode?: boolean;
  onActiveChange: (unitId: string) => void;
  onCompleteTask: (unitId: string) => Promise<void>;
};

const nodeTone: Record<GraphNodeStatus, string> = {
  completed: "fill-emerald-300 stroke-emerald-100",
  active: "fill-cyan-300 stroke-cyan-100",
  locked: "fill-zinc-700 stroke-zinc-500",
};

function buildPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const midpoint = previous.x + (current.x - previous.x) / 2;
    path += ` C ${midpoint} ${previous.y}, ${midpoint} ${current.y}, ${current.x} ${current.y}`;
  }

  return path;
}

function getPathProgress(timeline: TimelineMilestone[]): number {
  if (timeline.length <= 1) {
    return timeline[0]?.completion ?? 0;
  }

  let progressIndex = 0;

  for (let index = 0; index < timeline.length; index += 1) {
    const milestone = timeline[index];

    if (milestone.completion >= 1) {
      progressIndex = index;
      continue;
    }

    progressIndex = Math.min(index + milestone.completion, timeline.length - 1);
    return progressIndex / (timeline.length - 1);
  }

  return progressIndex / (timeline.length - 1);
}

export default function WavyRoadmapGraph({
  timeline,
  activeUnitId,
  rerouteMode = false,
  onActiveChange,
  onCompleteTask,
}: WavyRoadmapGraphProps) {
  const width = Math.max(940, timeline.length * 220);
  const height = 380;

  const points = useMemo(() => {
    const step = (width - 160) / Math.max(timeline.length - 1, 1);
    return timeline.map((milestone, index) => ({
      ...milestone,
      x: 80 + step * index,
      y: height * 0.5 + Math.sin(index * 1.15) * 88,
    }));
  }, [height, timeline, width]);

  const pathData = useMemo(() => buildPath(points), [points]);
  const targetProgress = useMemo(() => getPathProgress(timeline), [timeline]);

  const pathRef = useRef<SVGPathElement | null>(null);
  const progressMotion = useMotionValue(targetProgress);

  const [pathLength, setPathLength] = useState(1);
  const [orbPosition, setOrbPosition] = useState({
    x: points[0]?.x ?? 80,
    y: points[0]?.y ?? height / 2,
  });

  useEffect(() => {
    if (!pathRef.current) return;
    const nextLength = pathRef.current.getTotalLength();
    setPathLength(nextLength);

    const point = pathRef.current.getPointAtLength(nextLength * progressMotion.get());
    setOrbPosition({ x: point.x, y: point.y });
  }, [pathData, progressMotion]);

  useEffect(() => {
    const controls = animate(progressMotion, targetProgress, {
      type: "spring",
      stiffness: 92,
      damping: 18,
      mass: 0.9,
    });

    return () => {
      controls.stop();
    };
  }, [progressMotion, targetProgress]);

  useMotionValueEvent(progressMotion, "change", (latest) => {
    if (!pathRef.current) return;
    const targetLength = Math.max(pathLength * latest, 0);
    const point = pathRef.current.getPointAtLength(targetLength);
    setOrbPosition({ x: point.x, y: point.y });
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
      <section
        className={`rounded-[2rem] border p-5 backdrop-blur-2xl sm:p-7 ${
          rerouteMode
            ? "border-orange-300/35 bg-orange-500/[0.04]"
            : "border-white/15 bg-black/40"
        }`}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.24em] text-white/55 uppercase">Spatial Path</p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-white sm:text-4xl">
              Antigravity Progress Graph
            </h2>
          </div>
          {rerouteMode ? (
            <span className="rounded-full border border-orange-300/45 bg-orange-400/10 px-3 py-1 text-xs tracking-[0.16em] text-orange-200 uppercase">
              Reroute Active
            </span>
          ) : null}
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/50 p-4">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="mx-auto h-auto w-full min-w-[900px]"
            role="img"
            aria-label="Wavy roadmap timeline"
          >
            <defs>
              <linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="55%" stopColor="#93c5fd" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>

            <path ref={pathRef} d={pathData} fill="none" stroke="transparent" strokeWidth={0} />
            <path
              d={pathData}
              fill="none"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={3}
              strokeDasharray="8 10"
            />
            <motion.path
              d={pathData}
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth={4.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength: progressMotion }}
            />

            <motion.circle
              cx={orbPosition.x}
              cy={orbPosition.y}
              r={11}
              fill="rgba(103,232,249,0.95)"
              animate={{ r: [10, 12, 10], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />

            {points.map((point) => {
              const isActive = point.unitId === activeUnitId;

              return (
                <g
                  key={point.unitId}
                  className="cursor-pointer"
                  onClick={() => onActiveChange(point.unitId)}
                >
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isActive ? 18 : 13}
                    className={`${nodeTone[point.status]} stroke-[2] transition-all`}
                  />
                  <text
                    x={point.x}
                    y={point.y - 22}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.78)"
                    fontSize="11"
                    style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
                  >
                    {point.dateLabel}
                  </text>
                  <text
                    x={point.x}
                    y={point.y + 30}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.86)"
                    fontSize="12"
                  >
                    {point.title}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      <aside className="space-y-3">
        {timeline.map((milestone, index) => {
          const isActive = milestone.unitId === activeUnitId;
          const isLocked = milestone.status === "locked";

          return (
            <motion.article
              key={milestone.unitId}
              animate={{ y: [-5, 5] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "mirror", duration: 6 + index }}
              className={`rounded-2xl border p-4 backdrop-blur-xl transition ${
                isActive
                  ? "border-cyan-200/35 bg-cyan-300/[0.08]"
                  : "border-white/12 bg-black/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.16em] text-white/55 uppercase">{milestone.dateLabel}</p>
                  <h3 className="mt-1 text-sm font-medium text-white">{milestone.title}</h3>
                </div>
                {milestone.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                ) : isLocked ? (
                  <LockKeyhole className="h-4 w-4 text-zinc-500" />
                ) : (
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                )}
              </div>

              <p className="mt-2 text-xs leading-6 text-white/65">{milestone.note}</p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-white"
                  style={{ width: `${Math.round(milestone.completion * 100)}%` }}
                />
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onActiveChange(milestone.unitId)}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85 transition hover:border-white/40"
                >
                  Focus
                </button>
                <button
                  type="button"
                  disabled={isLocked || milestone.completion >= 1}
                  onClick={() => void onCompleteTask(milestone.unitId)}
                  className="inline-flex items-center gap-1 rounded-full border border-cyan-200/35 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100 transition hover:bg-cyan-200/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/35"
                >
                  Complete
                  <MoveRight className="h-3 w-3" />
                </button>
              </div>
            </motion.article>
          );
        })}
      </aside>
    </div>
  );
}
