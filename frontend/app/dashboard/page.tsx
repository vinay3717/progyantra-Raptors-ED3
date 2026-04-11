"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Trophy, UserRound, Zap } from "lucide-react";
import { useIsClient } from "@/hooks/useIsClient";

const weeklyProgress = [
  { day: "Mon", progress: 24 },
  { day: "Tue", progress: 32 },
  { day: "Wed", progress: 38 },
  { day: "Thu", progress: 47 },
  { day: "Fri", progress: 58 },
  { day: "Sat", progress: 66 },
  { day: "Sun", progress: 73 },
];

const projectGraph = [
  { name: "Auth", completed: 8, pending: 2 },
  { name: "Roadmap", completed: 13, pending: 4 },
  { name: "Graph", completed: 6, pending: 5 },
  { name: "Testing", completed: 4, pending: 3 },
];

const parameterMix = [
  { name: "Accuracy", value: 39 },
  { name: "Consistency", value: 27 },
  { name: "Speed", value: 20 },
  { name: "Depth", value: 14 },
];

const profile = {
  name: "Learner Prime",
  rank: 18,
  currentSkill: "Web Development",
  level: "Intermediate",
  streak: 17,
  points: 1240,
};

export default function DashboardPage() {
  const chartsReady = useIsClient();

  return (
    <div className="min-h-screen bg-black px-[6vw] pb-20 pt-10 text-white">
      <main className="mx-auto w-full max-w-7xl space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="rounded-[2rem] border border-white/12 bg-black/45 p-7 backdrop-blur-xl"
        >
          <p className="text-xs tracking-[0.24em] text-white/55 uppercase">User Dashboard</p>
          <h1 className="mt-2 font-display text-5xl tracking-tighter text-white sm:text-6xl">
            Personal Analytics Deck
          </h1>
        </motion.section>

        <section className="grid gap-4 lg:grid-cols-[0.35fr_0.65fr]">
          <article className="min-w-0 rounded-[2rem] border border-white/12 bg-black/45 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-white/8">
                <UserRound className="h-6 w-6 text-cyan-100" />
              </div>
              <div>
                <p className="text-xs tracking-[0.15em] text-white/55 uppercase">Profile</p>
                <h2 className="font-display text-2xl tracking-tight text-white">{profile.name}</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <p className="text-xs text-white/55">Current Skill</p>
                <p className="text-sm text-white">{profile.currentSkill}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <p className="text-xs text-white/55">Level</p>
                <p className="text-sm text-white">{profile.level}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <p className="text-xs text-white/55">Global Rank</p>
                <p className="text-sm text-white">#{profile.rank}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-white/55">Streak</p>
                <p className="mt-1 flex items-center gap-2 text-lg text-white">
                  <Zap className="h-4 w-4 text-cyan-200" />
                  {profile.streak}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-white/55">Points</p>
                <p className="mt-1 flex items-center gap-2 text-lg text-white">
                  <Trophy className="h-4 w-4 text-amber-300" />
                  {profile.points}
                </p>
              </div>
            </div>
          </article>

          <article className="min-w-0 rounded-[2rem] border border-white/12 bg-black/45 p-6 backdrop-blur-xl">
            <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Progress Graph</p>
            <h3 className="mt-2 font-display text-2xl tracking-tight text-white">Weekly Learning Momentum</h3>
            <div className="mt-4 h-72">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                  <AreaChart data={weeklyProgress}>
                    <defs>
                      <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8be9ff" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#8be9ff" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.55)" />
                    <YAxis stroke="rgba(255,255,255,0.55)" />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(0,0,0,0.92)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 14,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="progress"
                      stroke="#8be9ff"
                      strokeWidth={3}
                      fill="url(#progressGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="ghost-loader h-full rounded-2xl border border-white/10" />
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="min-w-0 rounded-[2rem] border border-white/12 bg-black/45 p-6 backdrop-blur-xl">
            <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Project Graph</p>
            <h3 className="mt-2 font-display text-2xl tracking-tight text-white">Module Delivery Balance</h3>
            <div className="mt-4 h-72">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                  <BarChart data={projectGraph}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.55)" />
                    <YAxis stroke="rgba(255,255,255,0.55)" />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(0,0,0,0.92)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 14,
                      }}
                    />
                    <Bar dataKey="completed" stackId="task" fill="#7dd3fc" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="pending" stackId="task" fill="rgba(255,255,255,0.2)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="ghost-loader h-full rounded-2xl border border-white/10" />
              )}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/12 bg-black/45 p-6 backdrop-blur-xl">
            <p className="text-xs tracking-[0.16em] text-white/55 uppercase">Parameter Graph</p>
            <h3 className="mt-2 font-display text-2xl tracking-tight text-white">Performance Mix</h3>
            <div className="mt-4 h-72">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(0,0,0,0.92)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 14,
                      }}
                    />
                    <Pie
                      data={parameterMix}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={102}
                      innerRadius={58}
                      stroke="rgba(255,255,255,0.18)"
                      fill="#8be9ff"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="ghost-loader h-full rounded-2xl border border-white/10" />
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
