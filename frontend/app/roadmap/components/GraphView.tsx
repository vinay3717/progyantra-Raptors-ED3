"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { GraphEdge, GraphNode, GraphNodeStatus } from "@/types/roadmap";

type GraphViewProps = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (unitId: string) => void;
};

const statusStyles: Record<GraphNodeStatus, string> = {
  locked: "fill-slate-600",
  active: "fill-sky-400",
  completed: "fill-emerald-400",
};

export default function GraphView({ nodes, edges, onNodeClick }: GraphViewProps) {
  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
      className="card-surface rounded-3xl p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-white">Skill Graph</h3>
        <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
          Prerequisites Map
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4">
        <svg
          width={620}
          height={260}
          viewBox="0 0 620 260"
          className="mx-auto h-auto w-full min-w-[620px]"
          role="img"
          aria-label="Roadmap skill graph"
        >
          {edges.map((edge) => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);
            if (!from || !to) return null;
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={2}
              />
            );
          })}

          {nodes.map((node) => (
            <g
              key={node.id}
              className="cursor-pointer transition hover:opacity-90"
              onClick={() => onNodeClick?.(node.id)}
            >
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={18}
                className={statusStyles[node.status]}
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
              <text
                x={node.x}
                y={node.y + 36}
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="12"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
          Locked
        </span>
        <span className="rounded-full border border-white/10 bg-sky-400/20 px-3 py-1 text-sky-200">
          Active
        </span>
        <span className="rounded-full border border-white/10 bg-emerald-400/20 px-3 py-1 text-emerald-200">
          Completed
        </span>
      </div>
    </motion.section>
  );
}
