"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { CheckCircle2, ChevronLeft, ChevronRight, LockKeyhole, MoveRight, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphNodeStatus } from "@/types/roadmap";

type TimelineMilestone = {
  unitId: string;
  title: string;
  startISO: string;
  dueISO: string;
  startLabel: string;
  dueLabel: string;
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
  const width = Math.max(1100, timeline.length * 250);
  const height = 440;
  const windowWidth = 1100;
  const windowHeight = height;

  const activeIndex = useMemo(() => {
    if (!activeUnitId) return 0;
    const idx = timeline.findIndex((item) => item.unitId === activeUnitId);
    return idx >= 0 ? idx : 0;
  }, [activeUnitId, timeline]);

  const [noteMode, setNoteMode] = useState<"near" | "all">("near");
  const [noteFilter, setNoteFilter] = useState<"all" | "done" | "upcoming">("all");

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

  const viewBoxX = useMemo(() => {
    const activeX = points[activeIndex]?.x ?? 0;
    const desired = activeX - windowWidth / 2;
    return Math.max(0, Math.min(desired, Math.max(0, width - windowWidth)));
  }, [activeIndex, points, width]);

  const viewBox = `${viewBoxX} 0 ${Math.min(windowWidth, width)} ${windowHeight}`;

  const visibleNotes = useMemo(() => {
    const base =
      noteMode === "all"
        ? timeline
        : timeline.slice(Math.max(0, activeIndex - 2), Math.min(timeline.length, activeIndex + 5));

    if (noteFilter === "done") {
      return base.filter((item) => item.status === "completed");
    }
    if (noteFilter === "upcoming") {
      return base.filter((item) => item.status !== "completed");
    }
    return base;
  }, [activeIndex, noteFilter, noteMode, timeline]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
      <section
        className={`relative rounded-[2rem] border p-5 backdrop-blur-2xl sm:p-7 ${
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
            <p className="mt-2 text-xs tracking-[0.16em] text-white/55 uppercase">
              {timeline[activeIndex]
                ? `${timeline[activeIndex].startLabel} → due ${timeline[activeIndex].dueLabel}`
                : null}
            </p>
          </div>
          {rerouteMode ? (
            <span className="rounded-full border border-orange-300/45 bg-orange-400/10 px-3 py-1 text-xs tracking-[0.16em] text-orange-200 uppercase">
              Reroute Active
            </span>
          ) : null}
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/50 p-4">
          <svg
            width="100%"
            height={520}
            viewBox={viewBox}
            className="block h-[520px] w-full"
            role="img"
            aria-label="Wavy roadmap timeline"
            preserveAspectRatio="xMidYMid meet"
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
              const isNear = Math.abs(points.findIndex((p) => p.unitId === point.unitId) - activeIndex) <= 2;

              return (
                <g
                  key={point.unitId}
                  className="cursor-pointer"
                  onClick={() => onActiveChange(point.unitId)}
                >
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isActive ? 22 : 16}
                    className={`${nodeTone[point.status]} stroke-[2] transition-all`}
                  />
                  {isNear || isActive ? (
                    <>
                      <text
                        x={point.x}
                        y={point.y - 24}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.82)"
                        fontSize="12"
                        style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}
                      >
                        {point.startLabel}
                      </text>
                      <text
                        x={point.x}
                        y={point.y + 34}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.88)"
                        fontSize="13"
                      >
                        {point.title}
                      </text>
                    </>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex gap-2 rounded-full border border-white/12 bg-black/45 p-1.5">
            <button
              type="button"
              onClick={() => onActiveChange(timeline[Math.max(0, activeIndex - 1)]?.unitId ?? timeline[0]?.unitId)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs tracking-[0.14em] text-white/80 uppercase transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              type="button"
              onClick={() =>
                onActiveChange(
                  timeline[Math.min(timeline.length - 1, activeIndex + 1)]?.unitId ??
                    timeline[timeline.length - 1]?.unitId
                )
              }
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs tracking-[0.14em] text-white/80 uppercase transition hover:bg-white/10 hover:text-white"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs tracking-[0.16em] text-white/55 uppercase">
            <span>
              Segment {activeIndex + 1} / {timeline.length}
            </span>
            {timeline[activeIndex] ? (
              <span
                className={`rounded-full border px-3 py-1 ${
                  timeline[activeIndex].status !== "completed" &&
                  dayjs().isAfter(dayjs(timeline[activeIndex].dueISO))
                    ? "border-orange-300/35 bg-orange-500/[0.08] text-orange-100"
                    : "border-white/15 bg-white/[0.03] text-white/65"
                }`}
              >
                Deadline {timeline[activeIndex].dueLabel}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <aside className="space-y-3">
        <div className="rounded-2xl border border-white/12 bg-black/40 p-4 backdrop-blur-xl">
          <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Notes</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setNoteMode((m) => (m === "near" ? "all" : "near"))}
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/75 transition hover:border-white/30"
            >
              {noteMode === "near" ? "Show All" : "Show Less"}
            </button>
            <button
              type="button"
              onClick={() => setNoteFilter("all")}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                noteFilter === "all"
                  ? "border-white/30 bg-white text-black"
                  : "border-white/15 text-white/75 hover:border-white/30"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setNoteFilter("done")}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                noteFilter === "done"
                  ? "border-white/30 bg-white text-black"
                  : "border-white/15 text-white/75 hover:border-white/30"
              }`}
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => setNoteFilter("upcoming")}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                noteFilter === "upcoming"
                  ? "border-white/30 bg-white text-black"
                  : "border-white/15 text-white/75 hover:border-white/30"
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>

        {visibleNotes.map((milestone, index) => {
          const isActive = milestone.unitId === activeUnitId;
          const isLocked = milestone.status === "locked";
          const overdue = milestone.status !== "completed" && dayjs().isAfter(dayjs(milestone.dueISO));

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
                  <p className="text-xs tracking-[0.16em] text-white/55 uppercase">
                    {milestone.startLabel} → due {milestone.dueLabel}
                  </p>
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
              {overdue ? (
                <p className="mt-2 inline-flex rounded-full border border-orange-300/35 bg-orange-500/[0.08] px-3 py-1 text-[11px] tracking-[0.14em] text-orange-100 uppercase">
                  Overdue
                </p>
              ) : null}

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
