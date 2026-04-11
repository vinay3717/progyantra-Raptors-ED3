"use client";

import dayjs from "dayjs";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { useRoadmap } from "@/hooks/useRoadmap";
import type { GraphNodeStatus, RoadmapData, Unit } from "@/types/roadmap";

type TimelineMilestone = {
  unitId: string;
  title: string;
  dateLabel: string;
  completion: number;
  status: GraphNodeStatus;
  note: string;
};

type RoadmapRuntimeContextValue = {
  skillSlug: string;
  roadmap: RoadmapData | null;
  loading: boolean;
  error: string | null;
  completionRate: number;
  activeUnitId: string | null;
  failCount: number;
  timeline: TimelineMilestone[];
  setActiveUnitId: (unitId: string) => void;
  registerAttempt: (isSuccess: boolean) => void;
  resetFailCount: () => void;
  completeNextTask: (unitId: string) => Promise<boolean>;
};

const RoadmapRuntimeContext = createContext<RoadmapRuntimeContextValue | null>(null);

function normalizeSkill(value: string | null | undefined): string {
  if (!value) return "web-development";
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function getUnitCompletion(unit: Unit): number {
  if (unit.subpoints.length === 0) return 0;
  const completed = unit.subpoints.filter((subpoint) => subpoint.status === "completed").length;
  return completed / unit.subpoints.length;
}

function getStatus(unit: Unit): GraphNodeStatus {
  const completion = getUnitCompletion(unit);
  if (completion >= 1) return "completed";
  if (completion > 0 || !unit.is_locked) return "active";
  return "locked";
}

export function RoadmapRuntimeProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const querySkill = searchParams.get("skill");

  const skillSlug = normalizeSkill(querySkill);
  const [manualActiveUnitId, setManualActiveUnitId] = useState<string | null>(null);
  const [failCount, setFailCount] = useState(0);

  const { roadmap, loading, error, completionRate, markSubpointCompleted } = useRoadmap(skillSlug);

  const activeUnitId = useMemo(() => {
    if (manualActiveUnitId && roadmap?.units.some((unit) => unit.id === manualActiveUnitId)) {
      return manualActiveUnitId;
    }

    if (!roadmap?.units.length) {
      return manualActiveUnitId;
    }

    const firstUnlocked = roadmap.units.find((unit) => !unit.is_locked) ?? roadmap.units[0];
    return firstUnlocked.id;
  }, [manualActiveUnitId, roadmap]);

  const setActiveUnitId = useCallback((unitId: string) => {
    setManualActiveUnitId(unitId);
  }, []);

  const registerAttempt = useCallback((isSuccess: boolean) => {
    setFailCount((previous) => (isSuccess ? 0 : previous + 1));
  }, []);

  const resetFailCount = useCallback(() => {
    setFailCount(0);
  }, []);

  const completeNextTask = useCallback(
    async (unitId: string) => {
      if (!roadmap) return false;

      const unitIndex = roadmap.units.findIndex((item) => item.id === unitId);
      if (unitIndex < 0) return false;

      const unit = roadmap.units[unitIndex];
      const targetSubpoint = unit.subpoints.find((subpoint) => subpoint.status !== "completed");
      if (!targetSubpoint) return false;

      await markSubpointCompleted(targetSubpoint.id, targetSubpoint.points_value || 10);

      const nextUnit = roadmap.units[unitIndex + 1];
      if (nextUnit) {
        setManualActiveUnitId(nextUnit.id);
      }

      return true;
    },
    [markSubpointCompleted, roadmap]
  );

  const timeline = useMemo<TimelineMilestone[]>(() => {
    if (!roadmap) return [];

    return roadmap.units.map((unit, index) => {
      const completion = getUnitCompletion(unit);
      return {
        unitId: unit.id,
        title: unit.title,
        dateLabel: dayjs().add(index * 7, "day").format("DD MMM"),
        completion,
        status: getStatus(unit),
        note:
          completion >= 1
            ? "Milestone mastered"
            : completion > 0
              ? "Currently in progress"
              : unit.is_locked
                ? "Unlock by finishing previous stage"
                : "Ready to start",
      };
    });
  }, [roadmap]);

  const value = useMemo<RoadmapRuntimeContextValue>(
    () => ({
      skillSlug,
      roadmap,
      loading,
      error,
      completionRate,
      activeUnitId,
      failCount,
      timeline,
      setActiveUnitId,
      registerAttempt,
      resetFailCount,
      completeNextTask,
    }),
    [
      skillSlug,
      roadmap,
      loading,
      error,
      completionRate,
      activeUnitId,
      failCount,
      timeline,
      setActiveUnitId,
      registerAttempt,
      resetFailCount,
      completeNextTask,
    ]
  );

  return <RoadmapRuntimeContext.Provider value={value}>{children}</RoadmapRuntimeContext.Provider>;
}

export function useRoadmapRuntime() {
  const context = useContext(RoadmapRuntimeContext);
  if (!context) {
    throw new Error("useRoadmapRuntime must be used inside RoadmapRuntimeProvider");
  }

  return context;
}
