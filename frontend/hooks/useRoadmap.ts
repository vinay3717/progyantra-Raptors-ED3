"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import type {
  DifficultyBand,
  GraphNodeStatus,
  RoadmapData,
  SubPoint,
  Unit,
} from "@/types/roadmap";

const mockRoadmap: RoadmapData = {
  skill: "web-development",
  difficulty_band: "beginner",
  user_score: 20,
  total_score: 100,
  score_tier: "52+",
  overview: {
    description:
      "Web development is the process of creating accessible, interactive, and scalable web applications.",
    career_impact:
      "Strong web developers are consistently in demand across startups, product companies, and global teams.",
    syllabus_summary: [
      "HTML Foundations",
      "CSS Systems",
      "JavaScript Core",
      "React Fundamentals",
      "Backend Basics",
    ],
    program_outcomes: [
      "Build responsive web interfaces from scratch",
      "Understand frontend architecture and component design",
      "Integrate APIs and manage application state",
      "Deploy and maintain production-grade apps",
    ],
  },
  units: [
    {
      id: "u1",
      title: "HTML Fundamentals",
      order_index: 1,
      unit_score: 20,
      is_locked: false,
      user_unit_progress: "2/4 subpoints complete",
      subpoints: [
        {
          id: "sp1",
          title: "Semantic HTML and accessibility landmarks",
          status: "completed",
          assessment_type: "quiz",
          points_value: 10,
          practice_url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
          learning_resource_url:
            "https://www.freecodecamp.org/news/semantic-html5-elements/",
        },
        {
          id: "sp2",
          title: "Forms, validation, and browser behavior",
          status: "completed",
          assessment_type: "task",
          points_value: 10,
          practice_url: "https://www.frontendmentor.io/",
          learning_resource_url:
            "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms",
        },
        {
          id: "sp3",
          title: "SEO and metadata essentials",
          status: "not_started",
          assessment_type: "none",
          points_value: 0,
          practice_url: "https://search.google.com/test/rich-results",
          learning_resource_url:
            "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
        },
        {
          id: "sp4",
          title: "Mini project: Portfolio page",
          status: "not_started",
          assessment_type: "project",
          points_value: 0,
          practice_url: "https://www.frontendmentor.io/challenges",
          learning_resource_url: "https://www.youtube.com/watch?v=G3e-cpL7ofc",
        },
      ],
    },
    {
      id: "u2",
      title: "CSS Architecture",
      order_index: 2,
      unit_score: 20,
      is_locked: false,
      user_unit_progress: "0/4 subpoints complete",
      subpoints: [
        {
          id: "sp5",
          title: "Cascade, specificity, and inheritance",
          status: "not_started",
          assessment_type: "quiz",
          points_value: 10,
          practice_url: "https://specificity.keegan.st/",
          learning_resource_url:
            "https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_and_inheritance",
        },
        {
          id: "sp6",
          title: "Flexbox and Grid systems",
          status: "not_started",
          assessment_type: "task",
          points_value: 10,
          practice_url: "https://cssgridgarden.com/",
          learning_resource_url:
            "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout",
        },
        {
          id: "sp7",
          title: "Responsive breakpoints and media queries",
          status: "not_started",
          assessment_type: "quiz",
          points_value: 10,
          practice_url: "https://web.dev/learn/design",
          learning_resource_url:
            "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Media_queries",
        },
        {
          id: "sp8",
          title: "Mini project: Product landing page",
          status: "not_started",
          assessment_type: "project",
          points_value: 10,
          practice_url: "https://www.frontendmentor.io/challenges",
          learning_resource_url: "https://www.youtube.com/watch?v=p0bGHP-PXD4",
        },
      ],
    },
    {
      id: "u3",
      title: "JavaScript Essentials",
      order_index: 3,
      unit_score: 20,
      is_locked: true,
      user_unit_progress: "0/4 subpoints complete",
      subpoints: [
        {
          id: "sp9",
          title: "Variables, scope, and data types",
          status: "not_started",
          assessment_type: "quiz",
          points_value: 10,
        },
        {
          id: "sp10",
          title: "Functions, arrays, and objects",
          status: "not_started",
          assessment_type: "task",
          points_value: 10,
        },
        {
          id: "sp11",
          title: "Asynchronous JS and promises",
          status: "not_started",
          assessment_type: "quiz",
          points_value: 10,
        },
        {
          id: "sp12",
          title: "Mini project: Task manager",
          status: "not_started",
          assessment_type: "project",
          points_value: 10,
        },
      ],
    },
  ],
  graph: {
    nodes: [
      {
        id: "u1",
        label: "HTML Fundamentals",
        x: 90,
        y: 170,
        type: "start",
        status: "completed",
      },
      {
        id: "u2",
        label: "CSS Architecture",
        x: 290,
        y: 90,
        type: "topic",
        status: "active",
      },
      {
        id: "u3",
        label: "JavaScript Essentials",
        x: 500,
        y: 170,
        type: "assessment",
        status: "locked",
      },
    ],
    edges: [
      { from: "u1", to: "u2" },
      { from: "u2", to: "u3" },
    ],
  },
};

function scoreTier(score: number) {
  if (score >= 90) return "S+";
  if (score >= 50) return "10+";
  return "52+";
}

function recalcUnitProgress(unit: Unit): Unit {
  const completed = unit.subpoints.filter((point) => point.status === "completed");
  return {
    ...unit,
    user_unit_progress: `${completed.length}/${unit.subpoints.length} subpoints complete`,
  };
}

function getNodeStatus(unit: Unit): GraphNodeStatus {
  const completedCount = unit.subpoints.filter(
    (subpoint) => subpoint.status === "completed"
  ).length;

  if (completedCount === unit.subpoints.length) return "completed";
  if (completedCount > 0 || !unit.is_locked) return "active";
  return "locked";
}

export function useRoadmap(skill: string) {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (typeof window !== "undefined") {
      const overrideRaw = window.localStorage.getItem(`ai_roadmap:${skill}`);
      if (overrideRaw) {
        try {
          const parsed = JSON.parse(overrideRaw) as RoadmapData;
          setRoadmap(parsed);
          setError("Using AI-generated roadmap (local override).");
          setLoading(false);
          return;
        } catch {
          window.localStorage.removeItem(`ai_roadmap:${skill}`);
        }
      }

      const lastRaw = window.localStorage.getItem("ai_roadmap:last");
      if (lastRaw) {
        try {
          const parsed = JSON.parse(lastRaw) as { skill?: string; roadmap?: RoadmapData };
          if (parsed.roadmap && parsed.skill === skill) {
            setRoadmap(parsed.roadmap);
            setError("Using latest AI-generated roadmap (local override).");
            setLoading(false);
            return;
          }
        } catch {
          window.localStorage.removeItem("ai_roadmap:last");
        }
      }
    }

    try {
      const { data } = await api.get<RoadmapData>(`/api/roadmap/${skill}`);
      setRoadmap(data);
    } catch {
      setRoadmap({ ...mockRoadmap, skill });
      setError("Using local roadmap preview. Backend route is not connected yet.");
    } finally {
      setLoading(false);
    }
  }, [skill]);

  useEffect(() => {
    void fetchRoadmap();
  }, [fetchRoadmap]);

  const markSubpointCompleted = async (subpointId: string, scoreEarned = 10) => {
    if (!roadmap) return;

    const updatedUnits = roadmap.units.map((unit) => {
      const nextSubpoints: SubPoint[] = unit.subpoints.map((subpoint) =>
        subpoint.id === subpointId
          ? { ...subpoint, status: "completed", points_value: scoreEarned }
          : subpoint
      );

      return recalcUnitProgress({ ...unit, subpoints: nextSubpoints });
    });

    const unlockedUnits = updatedUnits.map((unit, index) => {
      if (index === 0) return { ...unit, is_locked: false };
      const prevUnit = updatedUnits[index - 1];
      const prevDone = prevUnit.subpoints.every(
        (subpoint) => subpoint.status === "completed"
      );
      return { ...unit, is_locked: !prevDone };
    });

    const userScore = unlockedUnits
      .flatMap((unit) => unit.subpoints)
      .filter((subpoint) => subpoint.status === "completed")
      .reduce((acc, subpoint) => acc + subpoint.points_value, 0);

    const nextRoadmap: RoadmapData = {
      ...roadmap,
      units: unlockedUnits,
      user_score: Math.min(userScore, roadmap.total_score),
      score_tier: scoreTier(userScore),
      graph: {
        ...roadmap.graph,
        nodes: roadmap.graph.nodes.map((node) => {
          const matchingUnit = unlockedUnits.find((unit) => unit.id === node.id);
          return matchingUnit
            ? { ...node, status: getNodeStatus(matchingUnit) }
            : node;
        }),
      },
    };

    setRoadmap(nextRoadmap);

    try {
      await api.post("/api/roadmap/progress", {
        subpoint_id: subpointId,
        score_earned: scoreEarned,
      });
    } catch {
      // Frontend-first mode: optimistic state already updated.
    }
  };

  const completionRate = useMemo(() => {
    if (!roadmap) return 0;
    return Math.round((roadmap.user_score / roadmap.total_score) * 100);
  }, [roadmap]);

  return {
    roadmap,
    loading,
    error,
    completionRate,
    refetch: fetchRoadmap,
    markSubpointCompleted,
  };
}

export function difficultyLabel(level: DifficultyBand) {
  if (level === "beginner") return "Beginner";
  if (level === "intermediate") return "Intermediate";
  return "Advanced";
}
